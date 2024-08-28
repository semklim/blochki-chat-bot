interface IBotMenus {
  step: "idle" | "changeBd" | "day" | "month"; // крок форми, на якому ми знаходимося
  secretGuestMenu: "idle"
  | "contact"
  | "date"
  | "address"
  | "fasade"
  | "zale"
  | "chistotaVitrin"
  | "privitnist"
  | "noticeAndGreet"
  | "offerAdditional"
  | "giveReceipt"
  | "askApp"
  | "askTypeCoffee"
  | "rateAssortment"
  | "ratePricingPolicy"
  | "overallImpression"
  | "comeback"
  | "dishesChose"
  | "ratedishes"
  | "clientFewWords"
  | "recommendEstablishment"
  | "photos";
  addAddressMenu: "idle" | "add" | "edit";
  addSecretGuestMenu: "idle" | "add" | "edit";
  languageMenu: "idle" | "change";
}

interface QAndA {
  q: string
  a: number
}

interface SecretGuestFormPhoto {
  file_name: string
  mime_type: string
  file_id: string
  file_unique_id: string
}


type SecretFormData = Record<IBotMenus["secretGuestMenu"], QAndA>;


type SecretGuestFormData = Omit<SecretFormData, "idle", "photos"> & {
  date: string
  address: string
  photos: SecretGuestFormPhoto[];
}
