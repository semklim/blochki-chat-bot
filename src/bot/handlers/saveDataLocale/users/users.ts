import { getUsers, setUsers } from "#root/db/users.js";

type TSaveUser = { username?: User["username"], lang: User['lang'], chat_id: number, contact?: UserContact }

export async function saveUser({ username, chat_id, lang = "en", contact }: TSaveUser) {
  if (!username && !contact) {
    throw new Error('On of params must be not undefined');
  }

  let db = await getUsers();

  const user: User = {
    lang,
    user_id: chat_id,
    username,
    contact
  };

  if (!Array.isArray(db)) {
    db = [user];
    await setUsers(db);
    return;
  }

  const elIndx = db.findIndex((el) => {
    return el.username === user.username || el.contact?.user_id
  });

  if (elIndx < 0) db.push(user);

  if (db[elIndx]) {
    if (!db[elIndx].contact && contact) {
      db[elIndx].contact = contact;
    }
    if (!db[elIndx].username && username) {
      db[elIndx].username = username;
    }
    db[elIndx].user_id = chat_id;
  }

  await setUsers(db);
}

export async function updateUserLang(user_id: number, lang: User["lang"]) {
  const db = await getUsers();
  if (!db) return;
  const elIndx = db.findIndex((el) => {
    return el.user_id === user_id
  });

  if (db[elIndx]) {
    db[elIndx].lang = lang;
  }

  await setUsers(db);
}

export async function addUsersAdminPermission(username?: string[], phone?: string[]) {
  if (!username && !phone) {
    throw new Error('On of params must be not undefined');
  }

  const db = await getUsers();
  if (!db) {
    throw new Error('No one user in data base! Add user to db before calling this function!');
  }


  if (username) {
    db.map(user => {
      if (user.username && username.includes(user.username)) {
        user.isSecretGuest = true;
      }
    });
  }

  if (phone) {
    db.map(user => {
      if (user.contact && phone.includes(user.contact.phone_number)) {
        user.isSecretGuest = true;
      }
    });
  }

  await setUsers(db);
}

export async function addUsersSecretGuestPermission(username?: string[], phone?: string[]) {
  if (!username && !phone) {
    throw new Error('On of params must be not undefined');
  }

  const db = await getUsers();
  if (!db) {
    throw new Error('No one user in data base! Add user to db before calling this function!');
  }

  const users_id: {
    user_id: number;
    lang: User["lang"]
  }[] = [];

  if (username) {
    db.map(user => {
      if (user.username && username.includes(user.username)) {
        user.isSecretGuest = true;
        if (user.user_id) {
          users_id.push({
            user_id: user.user_id,
            lang: user.lang
          })
        }
      }
    });
  }

  if (phone) {
    db.map(user => {
      if (user.contact && phone.includes(user.contact.phone_number)) {
        user.isSecretGuest = true;
        if (user.user_id) {
          users_id.push({
            user_id: user.user_id,
            lang: user.lang
          })
        }
      }
    });
  }

  await setUsers(db);
  return users_id;
}

export async function isAdmin(username?: string, user_id?: number) {
  if (!username && !user_id) return false;

  const db = await getUsers();
  if (!db) {
    throw new Error('No one user in data base! Add user to db before calling this function!');
  }
  return db.some((user) => (user.username === username || user.contact?.user_id === user_id) && user.isAdmin);
}

export async function isSecretGuest(username?: string, user_id?: number) {
  if (!username && !user_id) return false;

  const db = await getUsers();
  if (!db) {
    throw new Error('No one user in data base! Add user to db before calling this function!');
  }
  return db.some((user) => (user.username === username || user.contact?.user_id === user_id) && user.isSecretGuest);
}