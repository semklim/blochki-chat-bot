
import { getSecretGuestForm, setSecretGuestForm } from "#root/db/secretGuest.js";

type Value = {
  user_id: number;
  value: SecretFormDBData,
}
export async function saveFormLocal({ value, user_id }: Value) {

  let db = await getSecretGuestForm();
  if (Array.isArray(db)) {
    const elIndx = db.findIndex((el) => el.user_id === user_id);
    if (elIndx >= 0) {
      if (db[elIndx].form) {
        db[elIndx].form.push({
          date: value.date,
          value: value
        })
      } else {
        db[elIndx].form = [{
          date: value.date,
          value: value
        }];
      }
    } else {
      db.push({
        user_id,
        form: [{
          date: value.date,
          value: value
        }]
      });
    }
  } else {
    db = [{
      user_id,
      form: [{
        date: value.date,
        value: value
      }]
    }];
  }

  await setSecretGuestForm(db);
}


export async function getFormLocal(user_id: number) {
  const db = await getSecretGuestForm();

  if (!Array.isArray(db)) return;

  return db.find((el) => el.user_id === user_id);
}