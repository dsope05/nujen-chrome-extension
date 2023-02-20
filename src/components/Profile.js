import React, { useEffect, useState, useCallback } from 'react';
import { useHistory } from 'react-router';
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/themes/prism.css';
import { magic } from '../magic';
import Loading from './Loading';

export default function Profile() {
  const [userMetadata, setUserMetadata] = useState();
  const [showError, setShowError] = useState(false);
  const [snackBar, showSnackBar] = useState(false)
  const [code, setCode] = React.useState(
`Intro
  https://example.com
  https://test.com
Body
  https://mycontent.com
Conclusion
  https://content.com
    







    `
  );
  const history = useHistory();

  const snackBarMessage = 'Content saved to nujen!';
  const errorMessage = 'Sorry there was an error!';

  useEffect(() => {
    // On mount, we check if a user is logged in.
    // If so, we'll retrieve the authenticated user's profile.
    magic.user.isLoggedIn().then((magicIsLoggedIn) => {
      if (magicIsLoggedIn) {
        console.log('isloggedin', magicIsLoggedIn)
        magic.user.getMetadata().then((data) => {
          setUserMetadata(data)
          return data;
        }).then((data) => {
          fetch(`https://nujen.love/api/readContentRecord`, {
            method: 'POST',
            body: JSON.stringify({
              email: data.email,
            })
            }).then(res => res.json()).then((res) => {
              if (res.data && res.data !== 'noRecord') {
                setCode(res.data)
              } else if (res.data === 'noRecord') {
                // do nothing
              } else {
                setShowError(true)
              }
            })
        });
      } else {
        // If no user is logged in, redirect to `/login`
        history.push('/login');
      }
    });
  }, []);

  /**
   * Perform logout action via Magic.
   */


  const logout = useCallback(() => {
    magic.user.logout().then(() => {
      history.push('/login');
    });
  }, [history]);

  const updateRecord = () => {
    if (userMetadata.email && code) {
      return fetch(`https://nujen.love/api/createContentRecord`, {
        method: 'POST',
        body: JSON.stringify({
          email: userMetadata.email,
          content: code,
        })
      }).then(res => res.json()).then((res) => {
        showSnackBar(true);
        setTimeout(() => {
          showSnackBar(false);
        }, 4000)
        console.log('response', res)
      }).catch((err) => {
        setShowError(true)
      })
    }
    console.log('NO RECORD SAVED')
  }

  return userMetadata ? (
    <div className='container'>
      <h1> Newsletter Curation Tool </h1>
      <Editor
        value={code}
        onValueChange={code => setCode(code)}
        highlight={code => highlight(code, languages.js)}
        padding={10}
        style={{
          fontFamily: '"Fira code", "Fira Mono", monospace',
          fontSize: 12,
        }}
      />
      { showError && (
        <p className='red'>
          { errorMessage }
        </p>
      )}
      { snackBar && (
        <p className='green'>
          { snackBarMessage }
        </p>
      )}
      <button onClick={updateRecord}>
        Save content
      </button>
    </div>
  ) : (
    <Loading />
  );
}
