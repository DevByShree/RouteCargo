const ROUTE_ALIASES = new Map([
  // Kokan is a common spelling of the Konkan coastal region in Maharashtra.
  ["kokan", "konkan"],
]);

function routeKey(value) {
  const normalized = String(value || "")
    .normalize("NFKC")
    .trim()
    .split(",", 1)[0]
    .trim()
    .replace(/\s+/g, " ")
    .toLocaleLowerCase("en-IN");
  return ROUTE_ALIASES.get(normalized) || normalized;
}

module.exports = routeKey;
