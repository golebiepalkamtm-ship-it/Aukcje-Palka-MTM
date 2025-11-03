const features = {
  newAuction: true,
  animatedHomepage: false,
  marketplaceV2: false,
};

export function isFeatureEnabled(feature: keyof typeof features) {
  return !!features[feature];
}
