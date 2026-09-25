import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "expo-router";
import { useEffect, useState, type ComponentProps } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  Modal,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { apiRequest } from "@/api/lumora/client";
import { AppText } from "@/components/ui/AppText";
import { followingKey } from "@/features/following/followingQueries";
import {
  emptyMediaState,
  mediaStateKey,
  mediaStateQueryOptions,
  type MediaActionState,
  type MediaUserState,
} from "@/features/media/mediaQueries";
import { useAuthStore } from "@/stores/authStore";
import { colors, radii, spacing } from "@/theme/tokens";
import type { ApiMediaType, WatchStatus } from "@/types/api";

interface MediaActionsProps {
  id: string;
  type: ApiMediaType;
}

interface StatusOption {
  type: WatchStatus;
  status: number;
  label: string;
  icon: ComponentProps<typeof Ionicons>["name"];
  color: string;
}

const allOptions: StatusOption[] = [
  {
    type: "seen",
    status: 1,
    label: "Visto",
    icon: "checkmark-circle-outline",
    color: colors.success,
  },
  {
    type: "pending",
    status: 2,
    label: "Pendiente",
    icon: "time-outline",
    color: colors.warning,
  },
  {
    type: "follow",
    status: 3,
    label: "Siguiendo",
    icon: "notifications-outline",
    color: colors.primary,
  },
  {
    type: "filed",
    status: 4,
    label: "Abandonada",
    icon: "archive-outline",
    color: colors.textSecondary,
  },
];

export function MediaActions({ id, type }: MediaActionsProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetAnimation] = useState(() => new Animated.Value(0));
  const token = useAuthStore((state) => state.token);
  const userId = useAuthStore((state) => state.user?.id ?? null);
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();
  const stateKey = mediaStateKey(type, id, userId);

  const mediaState = useQuery(mediaStateQueryOptions(type, id, token, userId));

  const refreshCollections = () => {
    void queryClient.invalidateQueries({ queryKey: ["lumora", "collection"] });
    void queryClient.invalidateQueries({ queryKey: followingKey(userId) });
    void queryClient.invalidateQueries({
      queryKey: ["lumora", "user", "stats"],
    });
  };

  const toggleWatch = useMutation({
    mutationFn: (status: WatchStatus) =>
      apiRequest<MediaActionState | null>(`/${type}/${id}/watch`, {
        method: "POST",
        token,
        body: { type: status },
      }),
    onMutate: async (status) => {
      await queryClient.cancelQueries({ queryKey: stateKey });
      const previous = queryClient.getQueryData<MediaUserState>(stateKey);
      const selectedStatus = allOptions.find(
        (option) => option.type === status,
      )?.status;
      const optimistic: MediaActionState | null =
        previous?.watchlist?.status === selectedStatus
          ? null
          : { status: selectedStatus };

      queryClient.setQueryData<MediaUserState>(stateKey, {
        ...(previous ?? emptyMediaState()),
        watchlist: optimistic,
      });

      return { previous };
    },
    onError: (_error, _status, context) => {
      queryClient.setQueryData(stateKey, context?.previous);
    },
    onSuccess: (data) => {
      queryClient.setQueryData<MediaUserState>(stateKey, (current) => ({
        ...(current ?? emptyMediaState()),
        watchlist: data,
      }));
      refreshCollections();
    },
  });

  const toggleFavorite = useMutation({
    mutationFn: () =>
      apiRequest<MediaActionState | null>(`/${type}/${id}/favorite`, {
        method: "POST",
        token,
      }),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: stateKey });
      const previous = queryClient.getQueryData<MediaUserState>(stateKey);
      const optimistic: MediaActionState | null = previous?.favorite?.id
        ? null
        : { id: -1 };

      queryClient.setQueryData<MediaUserState>(stateKey, {
        ...(previous ?? emptyMediaState()),
        favorite: optimistic,
      });

      return { previous };
    },
    onError: (_error, _variables, context) => {
      queryClient.setQueryData(stateKey, context?.previous);
    },
    onSuccess: (data) => {
      queryClient.setQueryData<MediaUserState>(stateKey, (current) => ({
        ...(current ?? emptyMediaState()),
        favorite: data,
      }));
      void queryClient.invalidateQueries({
        queryKey: ["lumora", "collection"],
      });
    },
  });

  useEffect(() => {
    if (!sheetOpen) return;

    sheetAnimation.setValue(0);
    Animated.timing(sheetAnimation, {
      toValue: 1,
      duration: 240,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [sheetAnimation, sheetOpen]);

  if (!token) {
    return (
      <Link href="/login" asChild>
        <Pressable style={styles.login}>
          <AppText variant="label" style={styles.loginText}>
            Inicia sesión para guardar
          </AppText>
        </Pressable>
      </Link>
    );
  }

  const options =
    type === "show"
      ? allOptions
      : allOptions.filter(
          (option) => option.type === "seen" || option.type === "pending",
        );
  const activeOption = options.find(
    (option) => option.status === mediaState.data?.watchlist?.status,
  );
  const watchLoading = mediaState.isLoading;
  const watchBusy = watchLoading || toggleWatch.isPending;
  const favoriteActive = Boolean(mediaState.data?.favorite?.id);
  const favoriteLoading = mediaState.isLoading;
  const favoriteBusy = favoriteLoading || toggleFavorite.isPending;

  const closeSheet = () => {
    Animated.timing(sheetAnimation, {
      toValue: 0,
      duration: 180,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) setSheetOpen(false);
    });
  };

  const selectStatus = (status: WatchStatus) => {
    closeSheet();
    toggleWatch.mutate(status);
  };

  return (
    <>
      <View style={styles.container}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Cambiar estado de colección"
          disabled={watchBusy}
          onPress={() => setSheetOpen(true)}
          style={({ pressed }) => [
            styles.statusButton,
            activeOption && {
              borderColor: activeOption.color,
              backgroundColor: colors.surfaceElevated,
            },
            pressed && styles.pressed,
            watchBusy && styles.disabled,
          ]}
        >
          {watchLoading ? (
            <ActivityIndicator
              size="small"
              color={activeOption?.color ?? colors.textSecondary}
            />
          ) : (
            <Ionicons
              name={activeOption?.icon ?? "add"}
              size={18}
              color={activeOption?.color ?? colors.textSecondary}
            />
          )}
          <AppText
            variant="caption"
            style={activeOption ? { color: activeOption.color } : undefined}
          >
            {activeOption?.label ?? "Añadir"}
          </AppText>
          <Ionicons
            name="chevron-down"
            size={14}
            color={activeOption?.color ?? colors.textMuted}
          />
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            favoriteActive ? "Quitar de favoritas" : "Añadir a favoritas"
          }
          accessibilityState={{ selected: favoriteActive }}
          disabled={favoriteBusy}
          onPress={() => toggleFavorite.mutate()}
          style={({ pressed }) => [
            styles.favorite,
            favoriteActive && styles.favoriteActive,
            pressed && styles.pressed,
            favoriteBusy && styles.disabled,
          ]}
        >
          {favoriteLoading ? (
            <ActivityIndicator size="small" color={colors.favorite} />
          ) : (
            <Ionicons
              name={favoriteActive ? "heart" : "heart-outline"}
              size={20}
              color={favoriteActive ? colors.favorite : colors.textMuted}
            />
          )}
        </Pressable>
      </View>

      {toggleWatch.isError || toggleFavorite.isError ? (
        <AppText variant="caption" style={styles.error}>
          No se pudo guardar el cambio. Inténtalo de nuevo.
        </AppText>
      ) : null}

      <Modal
        animationType="none"
        onRequestClose={closeSheet}
        presentationStyle="overFullScreen"
        transparent
        visible={sheetOpen}
      >
        <View style={styles.modal}>
          <Animated.View
            pointerEvents="none"
            style={[
              StyleSheet.absoluteFill,
              styles.backdrop,
              { opacity: sheetAnimation },
            ]}
          />
          <Pressable
            accessibilityLabel="Cerrar selector de estado"
            onPress={closeSheet}
            style={StyleSheet.absoluteFill}
          />
          <Animated.View
            style={[
              styles.sheet,
              { paddingBottom: Math.max(insets.bottom, spacing.lg) },
              {
                transform: [
                  {
                    translateY: sheetAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [520, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.handle} />
            <View style={styles.sheetHeading}>
              <AppText variant="heading">Estado</AppText>
              <AppText variant="caption" muted>
                Toca el estado activo para quitarlo de tu colección.
              </AppText>
            </View>

            {options.map((option) => {
              const active =
                option.status === mediaState.data?.watchlist?.status;
              return (
                <Pressable
                  key={option.type}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  onPress={() => selectStatus(option.type)}
                  style={({ pressed }) => [
                    styles.option,
                    pressed && styles.optionPressed,
                  ]}
                >
                  <View
                    style={[
                      styles.optionIcon,
                      active && {
                        borderColor: option.color,
                        backgroundColor: option.color,
                      },
                    ]}
                  >
                    <Ionicons
                      name={option.icon}
                      size={20}
                      color={active ? colors.black : colors.textSecondary}
                    />
                  </View>
                  <AppText
                    variant="label"
                    style={active ? { color: option.color } : undefined}
                  >
                    {option.label}
                  </AppText>
                  {active ? (
                    <Ionicons
                      name="checkmark"
                      size={21}
                      color={option.color}
                      style={styles.optionCheck}
                    />
                  ) : null}
                </Pressable>
              );
            })}
          </Animated.View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  statusButton: {
    minHeight: 42,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceElevated,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  favorite: {
    width: 42,
    height: 42,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceElevated,
    alignItems: "center",
    justifyContent: "center",
  },
  favoriteActive: {
    borderColor: colors.favorite,
    backgroundColor: "rgba(224, 80, 80, 0.14)",
  },
  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.97 }],
  },
  disabled: {
    opacity: 0.5,
  },
  error: {
    color: colors.favorite,
  },
  login: {
    minHeight: 48,
    borderRadius: radii.md,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  loginText: {
    color: colors.black,
  },
  modal: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    backgroundColor: "rgba(0, 0, 0, 0.58)",
  },
  sheet: {
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    overflow: "hidden",
  },
  handle: {
    alignSelf: "center",
    width: 38,
    height: 4,
    marginTop: spacing.md,
    marginBottom: spacing.md,
    borderRadius: radii.pill,
    backgroundColor: colors.surfacePressed,
  },
  sheetHeading: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.xs,
  },
  option: {
    minHeight: 66,
    paddingHorizontal: spacing.lg,
    borderTopWidth: 1,
    borderColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  optionPressed: {
    backgroundColor: colors.surfaceElevated,
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceElevated,
    alignItems: "center",
    justifyContent: "center",
  },
  optionCheck: {
    marginLeft: "auto",
  },
});
