import { auth, db } from './firebase';

// password is an optional parameter
export function registerUser(username, emailOrProvider, password) {
  if (password) {
    return new Promise((resolve, reject) => {
      if (username.length < 3) {
        reject(new Error("Your username must be 3 or more characters."))
      } else {
        db.ref('users').orderByChild('username').equalTo(username).once('value', function (snapshot) {
          if (snapshot.hasChildren()) {
            reject(new Error("Username already taken, try another."));
          } else {
            auth().createUserWithEmailAndPassword(emailOrProvider, password)
              .then((result) => {
                const newID = result.user.uid;
                db.ref('users/' + newID).set({
                  username: username,
                  email: emailOrProvider
                })
                  .then((result) => {
                    resolve();
                  })
                  .catch((error) => {
                    reject(error);
                  });
              })
              .catch((error) => {
                reject(error);
              });
          }
        });
      }
    });
  } else {

    return new Promise((resolve, reject) => {
      if (username.length < 3) {
        reject(new Error("Your username must be 3 or more characters."))
      } else {
        db.ref('users').orderByChild('username').equalTo(username).once('value', function (snapshot) {
          if (snapshot.hasChildren()) {
            reject(new Error("Username already taken, try another."));
          } else {
            const provider = emailOrProvider == 'github' ? new auth.GithubAuthProvider() : new auth.GoogleAuthProvider();

            auth().signInWithPopup(provider)
              .then((result) => {
                const newID = result.user.uid;
                db.ref('users/' + newID).set({
                  username: username,
                  email: result.user.email
                })
                  .then((result) => {
                    resolve();
                  })
                  .catch((error) => {
                    reject(error);
                  });
              })
              .catch((error) => {
                reject(error);
              });
          }
        });
      }
    });
  }
}

// password is an optional parameter
export function usernamePasswordSignin(usernameOrProvider, password) {
  if (password) {
    return new Promise((resolve, reject) => {
      db.ref('users').orderByChild('username').equalTo(usernameOrProvider).once('value', function (snapshot) {
        if (snapshot.hasChildren()) {
          const json = snapshot.toJSON();
          const key = Object.keys(json)[0];

          auth().signInWithEmailAndPassword(json[key].email, password)
            .then((user) => {
              resolve(user);
            })
            .catch((error) => {
              reject(error);
            });
        } else {
          reject(new Error("We don't recognize that username."));
        }
      })
    });
  } else {
    return new Promise((resolve, reject) => {
      const provider = usernameOrProvider == 'github' ? new auth.GithubAuthProvider() : new auth.GoogleAuthProvider();
      auth().signInWithPopup(provider)
        .then((result) => {
          db.ref('users').orderByChild('email').equalTo(result.user.email).once('value', function (snapshot) {
            if (snapshot.hasChildren()) {
              resolve(result);
            } else {
              auth().signOut()
                .then((result) => {
                  reject(new Error("Create an account with us first."));
                })
                .catch((error) => {
                  reject(error);
                });
            }
          })
        })
        .catch((error) => {
          reject(error);
        })
    })
  }
}

export function getUsername(uid) {
  return new Promise((resolve, reject) => {
    db.ref('users/' + uid).once('value', function(snapshot) {
      if (snapshot.hasChildren()) {
        resolve(snapshot.val().username)
      } else {
        reject(new Error("User doesn't exist."));
      }
    })
      .catch((error) => {
        reject(error);
      })
  })
}