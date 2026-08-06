import { Ionicons } from "@expo/vector-icons";
import { useListDonationCampaignsPublic, type DonationCampaign } from "@workspace/api-client-react";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { API_BASE_URL } from "@/utils/apiBase";

const DEFAULT_PRESETS = [10, 25, 50, 100];

function formatGBP(value: string | number | null | undefined): string {
  const num = Math.round(Number(value ?? 0));
  if (!Number.isFinite(num)) return "£0";
  return "£" + num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export default function DonateScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const router = useRouter();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const { data, isLoading, isError, refetch } = useListDonationCampaignsPublic();

  const [selectedCampaign, setSelectedCampaign] = useState<DonationCampaign | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [isOpeningCheckout, setIsOpeningCheckout] = useState(false);

  const campaigns = [...((data ?? []) as DonationCampaign[])]
    .filter((c) => c.active)
    .sort((a, b) => Number(b.featured) - Number(a.featured));

  const openCampaign = (campaign: DonationCampaign) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const presets = campaign.presetAmounts?.length ? campaign.presetAmounts : DEFAULT_PRESETS;
    setSelectedCampaign(campaign);
    setSelectedPreset(presets[1] ?? presets[0] ?? null);
    setCustomAmount("");
  };

  const closeSheet = () => {
    setSelectedCampaign(null);
    setCustomAmount("");
    setSelectedPreset(null);
  };

  const parsedCustom = Number(customAmount.trim());
  const effectiveAmount =
    customAmount.trim() !== ""
      ? Number.isFinite(parsedCustom) && parsedCustom > 0
        ? parsedCustom
        : null
      : selectedPreset;

  const openCheckout = async () => {
    if (!selectedCampaign || !effectiveAmount) return;
    setIsOpeningCheckout(true);
    try {
      const path = selectedCampaign.slug
        ? `/donate/${selectedCampaign.slug}?amount=${encodeURIComponent(effectiveAmount)}`
        : "/donate";
      await WebBrowser.openBrowserAsync(`${API_BASE_URL}${path}`);
      closeSheet();
    } catch {
      // Browser failed to open — keep the sheet so the user can retry
    } finally {
      setIsOpeningCheckout(false);
    }
  };

  const renderCampaign = ({ item }: { item: DonationCampaign }) => {
    const target = item.targetAmount ? Number(item.targetAmount) : null;
    const raised = Number(item.raisedAmount ?? 0);
    const pct =
      target && target > 0 ? Math.min(100, Math.round((raised / target) * 100)) : null;

    return (
      <TouchableOpacity
        style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
        onPress={() => openCampaign(item)}
        activeOpacity={0.85}
        testID={`campaign-${item.id}`}
      >
        {item.imageUrl && (
          <Image source={{ uri: item.imageUrl }} style={styles.cardImage} contentFit="cover" />
        )}
        <View style={styles.cardBody}>
          <View style={styles.titleRow}>
            <Text
              style={[
                styles.cardTitle,
                { color: colors.foreground, fontFamily: "PlayfairDisplay_700Bold" },
              ]}
              numberOfLines={2}
            >
              {item.title}
            </Text>
            {item.featured && (
              <View style={[styles.featuredBadge, { backgroundColor: colors.accent + "25" }]}>
                <Text style={[styles.featuredText, { color: colors.accent }]}>Featured</Text>
              </View>
            )}
          </View>
          <Text style={[styles.cardDesc, { color: colors.mutedForeground }]} numberOfLines={3}>
            {item.description}
          </Text>

          {target != null && (
            <View style={styles.progressBlock}>
              <View style={[styles.progressTrack, { backgroundColor: colors.muted }]}>
                <View
                  style={[
                    styles.progressFill,
                    { backgroundColor: colors.accent, width: `${pct ?? 0}%` },
                  ]}
                />
              </View>
              <View style={styles.progressRow}>
                <Text style={[styles.raisedText, { color: colors.primary }]}>
                  {formatGBP(item.raisedAmount)} raised
                </Text>
                <Text style={[styles.targetText, { color: colors.mutedForeground }]}>
                  Target {formatGBP(item.targetAmount)}
                </Text>
              </View>
            </View>
          )}

          <View style={[styles.donateRow, { borderTopColor: colors.border }]}>
            <Ionicons name="heart" size={15} color={colors.accent} />
            <Text style={[styles.donateRowText, { color: colors.primary }]}>
              Donate to this campaign
            </Text>
            <Ionicons name="chevron-forward" size={15} color={colors.mutedForeground} />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const presets = selectedCampaign?.presetAmounts?.length
    ? selectedCampaign.presetAmounts
    : DEFAULT_PRESETS;

  return (
    <View style={[styles.flex, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <View
        style={[
          styles.header,
          { paddingTop: topPad + 12, backgroundColor: colors.background, borderBottomColor: colors.border },
        ]}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.backBtn, { backgroundColor: colors.card }]}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityLabel="Go back"
          testID="back-btn"
        >
          <Ionicons name="chevron-back" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text
            style={[styles.title, { color: colors.foreground, fontFamily: "PlayfairDisplay_700Bold" }]}
          >
            Donate
          </Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            Support Grays Park Masjid
          </Text>
        </View>
      </View>

      {isLoading && (
        <View style={styles.centerFlex}>
          <ActivityIndicator color={colors.primary} size="large" />
          <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>
            Loading campaigns…
          </Text>
        </View>
      )}

      {isError && (
        <View style={styles.centerFlex}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.mutedForeground} />
          <Text style={[styles.errorText, { color: colors.mutedForeground }]}>
            Unable to load campaigns
          </Text>
          <TouchableOpacity
            onPress={() => refetch()}
            style={[styles.retryBtn, { backgroundColor: colors.primary }]}
          >
            <Text style={[styles.retryText, { color: colors.primaryForeground }]}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {!isLoading && !isError && (
        <FlatList
          data={campaigns}
          keyExtractor={(item) => item.id}
          renderItem={renderCampaign}
          contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 40 }]}
          showsVerticalScrollIndicator={false}
          scrollEnabled={campaigns.length > 0}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={refetch}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.centerFlex}>
              <Ionicons name="heart-outline" size={48} color={colors.mutedForeground} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                No active campaigns
              </Text>
              <Text style={[styles.emptySubText, { color: colors.mutedForeground + "99" }]}>
                Check back soon for ways to give
              </Text>
            </View>
          }
        />
      )}

      {/* ── Amount selection sheet ── */}
      <Modal
        visible={!!selectedCampaign}
        transparent
        animationType="slide"
        onRequestClose={closeSheet}
        statusBarTranslucent
      >
        <View style={styles.sheetOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={closeSheet} />
          <View
            style={[
              styles.sheet,
              { backgroundColor: colors.card, paddingBottom: insets.bottom + 20 },
            ]}
          >
            <View style={[styles.sheetHandle, { backgroundColor: colors.border }]} />
            <Text
              style={[
                styles.sheetTitle,
                { color: colors.foreground, fontFamily: "PlayfairDisplay_700Bold" },
              ]}
              numberOfLines={2}
            >
              {selectedCampaign?.title}
            </Text>
            <Text style={[styles.sheetSub, { color: colors.mutedForeground }]}>
              Choose an amount to donate
            </Text>

            <View style={styles.presetGrid}>
              {presets.map((preset) => {
                const isSelected = selectedPreset === preset && customAmount.trim() === "";
                return (
                  <TouchableOpacity
                    key={preset}
                    style={[
                      styles.presetBtn,
                      {
                        backgroundColor: isSelected ? colors.primary : colors.background,
                        borderColor: isSelected ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => {
                      setSelectedPreset(preset);
                      setCustomAmount("");
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                    testID={`preset-${preset}`}
                  >
                    <Text
                      style={[
                        styles.presetText,
                        { color: isSelected ? colors.primaryForeground : colors.foreground },
                      ]}
                    >
                      £{preset}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TextInput
              style={[
                styles.customInput,
                {
                  borderColor: customAmount.trim() !== "" ? colors.primary : colors.input,
                  color: colors.foreground,
                  backgroundColor: colors.background,
                },
              ]}
              placeholder="Other amount (£)"
              placeholderTextColor={colors.mutedForeground}
              keyboardType="decimal-pad"
              value={customAmount}
              onChangeText={setCustomAmount}
              testID="custom-amount"
            />
            {customAmount.trim() !== "" && effectiveAmount === null && (
              <Text style={[styles.invalidText, { color: colors.destructive }]}>
                Please enter a valid amount
              </Text>
            )}

            <TouchableOpacity
              style={[
                styles.checkoutBtn,
                { backgroundColor: effectiveAmount ? colors.primary : colors.muted },
              ]}
              onPress={openCheckout}
              disabled={!effectiveAmount || isOpeningCheckout}
              activeOpacity={0.85}
              testID="checkout-btn"
            >
              {isOpeningCheckout ? (
                <ActivityIndicator size="small" color={colors.primaryForeground} />
              ) : (
                <>
                  <Ionicons
                    name="lock-closed"
                    size={16}
                    color={effectiveAmount ? colors.accent : colors.mutedForeground}
                  />
                  <Text
                    style={[
                      styles.checkoutText,
                      { color: effectiveAmount ? colors.primaryForeground : colors.mutedForeground },
                    ]}
                  >
                    {effectiveAmount
                      ? `Continue to Secure Checkout · ${formatGBP(effectiveAmount)}`
                      : "Select an amount"}
                  </Text>
                </>
              )}
            </TouchableOpacity>
            <Text style={[styles.checkoutNote, { color: colors.mutedForeground }]}>
              Checkout opens securely on our website. Zakat, Sadaqah, and Lillah accepted.
            </Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  centerFlex: { flex: 1, alignItems: "center", justifyContent: "center", gap: 8, paddingTop: 40 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: { fontSize: 26, fontWeight: "700" },
  subtitle: { fontSize: 13, marginTop: 2 },
  listContent: { padding: 16, gap: 12 },
  card: { borderRadius: 16, overflow: "hidden", borderWidth: 1 },
  cardImage: { width: "100%", height: 150 },
  cardBody: { padding: 16, gap: 10 },
  titleRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  cardTitle: { flex: 1, fontSize: 18, fontWeight: "700", lineHeight: 25 },
  featuredBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    flexShrink: 0,
    marginTop: 3,
  },
  featuredText: { fontSize: 10, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 },
  cardDesc: { fontSize: 13, lineHeight: 20 },
  progressBlock: { gap: 6, marginTop: 2 },
  progressTrack: { height: 8, borderRadius: 4, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 4 },
  progressRow: { flexDirection: "row", justifyContent: "space-between" },
  raisedText: { fontSize: 13, fontWeight: "700" },
  targetText: { fontSize: 13 },
  donateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderTopWidth: 1,
    paddingTop: 12,
    marginTop: 2,
  },
  donateRowText: { flex: 1, fontSize: 14, fontWeight: "600" },
  loadingText: { fontSize: 15, marginTop: 8 },
  errorText: { fontSize: 15 },
  emptyText: { fontSize: 16, fontWeight: "600" },
  emptySubText: { fontSize: 14 },
  retryBtn: { paddingHorizontal: 24, paddingVertical: 10, borderRadius: 8 },
  retryText: { fontSize: 15, fontWeight: "600" },
  // Amount sheet
  sheetOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.50)",
  },
  sheet: {
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 22,
    paddingTop: 12,
  },
  sheetHandle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    marginBottom: 16,
  },
  sheetTitle: { fontSize: 20, fontWeight: "700", lineHeight: 27 },
  sheetSub: { fontSize: 13, marginTop: 4, marginBottom: 16 },
  presetGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  presetBtn: {
    flexGrow: 1,
    flexBasis: "22%",
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: "center",
  },
  presetText: { fontSize: 16, fontWeight: "700" },
  customInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 6,
  },
  invalidText: { fontSize: 12, marginBottom: 4 },
  checkoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 12,
    paddingVertical: 15,
    marginTop: 10,
  },
  checkoutText: { fontSize: 15, fontWeight: "700" },
  checkoutNote: { fontSize: 11, textAlign: "center", marginTop: 10, lineHeight: 16 },
});
