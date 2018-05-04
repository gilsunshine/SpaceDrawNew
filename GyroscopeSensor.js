import React from 'react';
import {
  Gyroscope,
} from 'expo';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

export default class GyroscopeSensor extends React.Component {
  state = {
    gyroscopeData: {},
  }

  componentDidMount() {
    this._toggle();
  }

  componentWillUnmount() {
    this._unsubscribe();
  }

  _toggle = () => {
    if (this._subscription) {
      this._unsubscribe();
    } else {
      this._subscribe();
    }
  }

  _slow = () => {
    Gyroscope.setUpdateInterval(1000);
  }

  _fast = () => {
    Gyroscope.setUpdateInterval(16);
  }

  _subscribe = () => {
    this._subscription = Gyroscope.addListener((gyroscopeData) => {
      this.props.setGyroData({gyroscopeData});
    });
    Gyroscope.setUpdateInterval(10);
  }

  _unsubscribe = () => {
    this._subscription && this._subscription.remove();
    this._subscription = null;
  }

  render() {
    let { x, y, z } = this.state.gyroscopeData;

    return (
      <View>

      </View>
    );
  }
}

function round(n) {
  if (!n) {
    return 0;
  }

  return Math.floor(n * 100) / 100;
}
