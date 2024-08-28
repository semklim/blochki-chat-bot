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

type UserContact = {
  phone_number: string;
  first_name: string;
  user_id: number;
  last_name?: string;
  vcard?: string;
};

type User = {
  contact?: UserContact;
  user_id?: number;
  lang: "en" | "uk";
  username?: string;
  isAdmin?: boolean;
  isSecretGuest?: boolean;
}

type Users = Array<User>;