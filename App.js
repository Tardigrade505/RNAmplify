import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import Amplify, { Auth, API } from 'aws-amplify';
import { withAuthenticator } from 'aws-amplify-react-native'

Amplify.configure({
    Auth: {
        region: 'us-west-2',
        userPoolId: 'us-west-2_SR0KH9zON',
        userPoolWebClientId: '5ki7bnuimr2ujomrdi6kqk5u9s',
        mandatorySignIn: false,
    },
    API: {
      endpoints: [
        {
          name: "accounts",
          endpoint:
            "https://fvilydx9s4.execute-api.us-west-2.amazonaws.com/prod/",
        },
      ],
    },
    Analytics: {
      disabled: true,  // Disabling for now to remove warnings
    },
});

// You can get the current config object
const currentConfig = Auth.configure();


async function signOut() {
  try {
      await Auth.signOut();
  } catch (error) {
      console.log('error signing out: ', error);
  }
}

const App = () => {
  const [helloState, setHelloState] = useState('Initial');
  const [accountState, setAccountState] = useState('Initial');
  const [currentJWT, setCurrentJWT] = useState('');
  const [currentUserInfo, setCurrentUserInfo] = useState({});

  useEffect(() => {
    async function setSessionInfo() {
      setCurrentJWT((await Auth.currentSession()).getIdToken().getJwtToken());
      setCurrentUserInfo(await Auth.currentUserInfo())
    }
    setSessionInfo();
  }, [Auth])

  async function fetchHello() {
    const hello = await API.get('accounts', 'hello', { 
      headers: { 
        'Authorization': `Bearer ${currentJWT}`,
      },
    });
    console.log(hello);
    setHelloState(hello);
  }

  async function fetchAccount() {
    console.log(`Current User Info: ${JSON.stringify(currentUserInfo)}`);
    const account = await API.get('accounts', `user_account?handle=${currentUserInfo.username}`, { 
      headers: { 
        'Authorization': `Bearer ${currentJWT}`,
      },
    });
    console.log(account);
    setAccountState(account);
  }
  
  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <Button
        onPress={() => fetchHello()}
        title="Say Hello!"
        color="#841584"
        accessibilityLabel="Learn more about this purple button"
      />
      <Text>{helloState}</Text>
      <Button
        onPress={() => fetchAccount()}
        title="View Account!"
        color="#192f91"
        accessibilityLabel="Learn more about this purple button"
      />
      <Text>{JSON.stringify(accountState)}</Text>
      <Button
        onPress={() => signOut()}
        title="Log Out"
        color="#d16d15"
        accessibilityLabel="Learn more about this purple button"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default withAuthenticator(App)
