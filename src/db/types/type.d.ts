type SecretGuestFirstPart = Record<
  IBotMenus["secretGuestMenu"], QAndA>

type SecretFormDBData = Omit<SecretGuestFirstPart, "idle" | "photos" | "contact" | "date" | "address"> & {
  date: string
  address: string
  photos: SecretGuestFormPhoto[];
};



type SecretGuestFormDataLocal = Array<{
  user_id: number;
  form?: Array<{
    date: string;
    value: SecretFormDBData;
  }>
}>