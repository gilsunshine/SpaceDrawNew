import ExpoTHREE, {THREE} from 'expo-three';
import React from 'react';
import { StyleSheet, Text, View, PanResponder, TouchableOpacity, TouchableHighlight, Image, CameraRoll, Slider} from 'react-native';
import { Card, Button, FormLabel, FormInput } from 'react-native-elements';
import UUID from 'uuid'
import Expo, { Constants, Camera, takeSnapshotAsync } from 'expo';
import { Accelerometer } from 'expo';
import TimerMixin from 'react-timer-mixin'
import { ColorPicker, TriangleColorPicker } from 'react-native-color-picker'
import Icon from 'react-native-vector-icons/FontAwesome';

console.disableYellowBox = true;

let rotateX = 0
let rotateY = 0
Expo.ScreenOrientation.allow(Expo.ScreenOrientation.Orientation.PORTRAIT);

export default class App extends React.Component {

  constructor(){
    super()
    this.state = {
      drawCurve: false,
      previousMesh: null,
      previousPoint: {},
      sameMesh: false,
      released: false,
      meshes: [],
      persist: false,
      color: {r: 0, g: 0, b: 255},
      showColorPicker: false,
      arDisplay: 'container',
      clearScene: false,
      cameraRollUri: null,
      hsvColor: { h: 240, s: 1, v: 1 },
      size: 0.01,
      removeLastChild: false,
      showInfo: false,
      shape: 'circle',
      extrusionShape: 0,
      extrusionSize: 2,
      material: 'lambert',
      extrusionMaterial: 1
    }
  }

  mixins: [TimerMixin]
  componentWillMount () {
    this.panResponder = PanResponder.create({
      onStartShouldSetPanResponder: (e, gestureState) => true,
      onStartShouldSetPanResponderCapture: (e, gestureState) => true,
      onMoveShouldSetPanResponder: (e, gestureState) => true,
      onMoveShouldSetPanResponderCapture: (e, gestureState) => true,
      onPanResponderGrant: this._handleOnPanResponderGrant.bind(this),
      onPanResponderMove: this._handleOnPanResponderMove.bind(this),
      onPanResponderRelease: this._handlePanResponderRelease.bind(this)
    })
  }

  _handleOnPanResponderGrant = (e, gestureState) => {
    console.log("grant...")
    this.touching = true
    this.setState({drawCurve: true})
    this.setState({sameMesh: true})
  }

  _handleOnPanResponderMove = (e, gestureState) => {
  }

  _handlePanResponderRelease = (e, gestureState) => {
    console.log("done...")
    this.setState({sameMesh: false})
    this.setState({released: true})
    this.touching = false
  }

  setColor = (color) => {
    this.setState({hsvColor: color})
    let h = this.mapThis(color.h, 0, 359, 0, 1)
    let s = color.s
    let v = color.v
    let newColor = this.HSVtoRGB(h, s, v)
    this.setState({color: newColor})
  }

  HSVtoRGB = (h, s, v) => {
    var r, g, b, i, f, p, q, t;
    if (arguments.length === 1) {
      s = h.s, v = h.v, h = h.h;
    }
    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);
    switch (i % 6) {
      case 0: r = v, g = t, b = p; break;
      case 1: r = q, g = v, b = p; break;
      case 2: r = p, g = v, b = t; break;
      case 3: r = p, g = q, b = v; break;
      case 4: r = t, g = p, b = v; break;
      case 5: r = v, g = p, b = q; break;
    }
    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255)
    };
  }

  mapThis = (num, inMin, inMax, outMin, outMax) => {
    return (num - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
  }

  showColorPicker = () => {
    this.setState({showColorPicker: !this.state.showColorPicker})
    if(this.state.arDisplay === 'container'){
      this.setState({arDisplay: 'hiddenContainer'})
    } else {
      this.setState({arDisplay: 'container'})
    }
  }

  clearScene = () => {
    this.setState({clearScene: true})
  }

  showInfo = () => {
    this.setState({showInfo: !this.state.showInfo})
    if(this.state.arDisplay === 'container'){
      this.setState({arDisplay: 'hiddenContainer'})
    } else {
      this.setState({arDisplay: 'container'})
    }
  }

  removeLastChild = () => {
    this.setState({removeLastChild: true})
  }

  _saveToCameraRollAsync = async () => {
    let result = await takeSnapshotAsync(this._glView, {
      format: 'png',
      result: 'file',
    });
    console.log('hello')

    let saveResult = await CameraRoll.saveToCameraRoll(result, 'photo');
    this.setState({ cameraRollUri: saveResult });
  };

  change(value) {
    this.setState(() => {
      return {
        size: parseFloat(value),
      };
    });
  }

  changeSize = (value) => {
    if(value === 0) {
      this.setState({size: 0.001})
    } else if (value === 1) {
      this.setState({size: 0.004})
    } else if (value === 2) {
      this.setState({size: 0.01})
    } else if (value === 3) {
      this.setState({size: 0.03})
    } else if (value === 4) {
      this.setState({size: 0.08})
    }
    this.setState({extrusionSize: value})
  }

  changeShape = (value) => {
    if(value === 0) {
      this.setState({shape: 'circle'})
    } else if (value === 1) {
      this.setState({shape: 'triangle'})
    } else if (value === 2) {
      this.setState({shape: 'square'})
    } else if (value === 3) {
      this.setState({shape: 'tube'})
    } else if (value === 4) {
      this.setState({shape: 'slash'})
    }
    this.setState({extrusionShape: value})
  }

  changeMaterial = (value) => {
    if(value === 0) {
      this.setState({material: 'basic'})
    } else if (value === 1) {
      this.setState({material: 'lambert'})
    } else if (value === 2) {
      this.setState({material: 'metal'})
    } else if (value === 3) {
      this.setState({material: 'transparent'})
    } else if (value === 4) {
      this.setState({material: 'normal'})
    }
    this.setState({extrusionMaterial: value})
  }

  render() {
     return (
       <View
         behavior="padding"
         style={{ flex: 1 }}>
         {this.state.showInfo ? <View
           style={{flex: 1, backgroundColor: '#ffffff'}}
         >
           <View style={{position: 'relative', width: '100%', height: '100%'}}>
           </View>
           <Button
              style={{position: 'relative', bottom: '135%'}}
              backgroundColor="#aaa"
              title="EXTRUDE"
              onPress={() => {this.showInfo()}}
            />
         </View> : null}

        {this.state.showColorPicker ? <View style={{flex: 1, backgroundColor: '#ffffff'}}>
           <View style={{flex: 0.25}} />
           <Text style={{left: '6%', fontFamily: 'Roboto', fontSize: 18}}>Color</Text>
           <View style={{flex: 0.025}} />
           <View style={{flex: 0.06}} />
           <TriangleColorPicker
             onColorChange={color => this.setColor(color)}
             color={this.state.hsvColor}
             style={{flex: 1.5, position: 'relative', left: '5%', width: '90%', backgroundColor: 'rgba(0,0,0,0)'}}
           />

           <View style={{height: '3%'}} />
           <Text style={{left: '6%', fontFamily: 'Roboto', fontSize: 18}}>Size</Text>
           <View style={{flex: 0.05}} />
            <View style={{flexDirection: 'row', flex: 0.5}}>
              <View style={{width: '5%'}}/>
              {this.state.extrusionSize === 0 ? <TouchableOpacity style={{position: 'relative', top: 0, left: 0}} onPress={() => {this.changeSize(0)}}>
                <Image
                  style={{resizeMode: 'center', width: 54, height: 54, margin: '3%'}}
                  source={require('./xs_alt.png')}
                />
              </TouchableOpacity> : <TouchableOpacity style={{position: 'relative', top: 0, left: 0}} onPress={() => {this.changeSize(0)}}>
                <Image
                  style={{resizeMode: 'center', width: 54, height: 54, margin: '3%'}}
                  source={require('./xs.png')}
                />
              </TouchableOpacity>}

              {this.state.extrusionSize === 1 ? <TouchableOpacity style={{position: 'relative', top: 0, left: 0}} onPress={() => {this.changeSize(1)}}>
                <Image
                  style={{resizeMode: 'center', width: 54, height: 54, margin: '3%'}}
                  source={require('./s_alt.png')}
                />
              </TouchableOpacity> : <TouchableOpacity style={{position: 'relative', top: 0, left: 0}} onPress={() => {this.changeSize(1)}}>
                <Image
                  style={{resizeMode: 'center', width: 54, height: 54, margin: '3%'}}
                  source={require('./s.png')}
                />
              </TouchableOpacity>}

              {this.state.extrusionSize === 2 ? <TouchableOpacity style={{position: 'relative', top: 0, left: 0}} onPress={() => {this.changeSize(2)}}>
                <Image
                  style={{resizeMode: 'center', width: 54, height: 54, margin: '3%'}}
                  source={require('./m_alt.png')}
                />
              </TouchableOpacity> : <TouchableOpacity style={{position: 'relative', top: 0, left: 0}} onPress={() => {this.changeSize(2)}}>
                <Image
                  style={{resizeMode: 'center', width: 54, height: 54, margin: '3%'}}
                  source={require('./m.png')}
                />
              </TouchableOpacity>}

              {this.state.extrusionSize === 3 ? <TouchableOpacity style={{position: 'relative', top: 0, left: 0}} onPress={() => {this.changeSize(3)}}>
                <Image
                  style={{resizeMode: 'center', width: 54, height: 54, margin: '3%'}}
                  source={require('./l_alt.png')}
                />
              </TouchableOpacity> : <TouchableOpacity style={{position: 'relative', top: 0, left: 0}} onPress={() => {this.changeSize(3)}}>
                <Image
                  style={{resizeMode: 'center', width: 54, height: 54, margin: '3%'}}
                  source={require('./l.png')}
                />
              </TouchableOpacity>}

              {this.state.extrusionSize === 4 ? <TouchableOpacity style={{position: 'relative', top: 0, left: 0}} onPress={() => {this.changeSize(4)}}>
                <Image
                  style={{resizeMode: 'center', width: 54, height: 54, margin: '3%'}}
                  source={require('./xl_alt.png')}
                />
              </TouchableOpacity> : <TouchableOpacity style={{position: 'relative', top: 0, left: 0}} onPress={() => {this.changeSize(4)}}>
              <Image
                style={{resizeMode: 'center', width: 54, height: 54, margin: '3%'}}
                source={require('./xl.png')}
              />
            </TouchableOpacity>}
            </View>

            <Text style={{left: '6%', fontFamily: 'Roboto', fontSize: 18}}>Shape</Text>
            <View style={{flex: 0.05}} />
            <View style={{flexDirection: 'row', flex: 0.5}}>
              <View style={{width: '5%'}}/>
              {this.state.extrusionShape === 0 ? <TouchableOpacity style={{position: 'relative', top: 0, left: 0}} onPress={() => {this.changeShape(0)}}>
                <Image
                  style={{resizeMode: 'center', width: 54, height: 54, margin: '3%'}}
                  source={require('./circle_alt.png')}
                />
              </TouchableOpacity> : <TouchableOpacity style={{position: 'relative', top: 0, left: 0}} onPress={() => {this.changeShape(0)}}>
                <Image
                  style={{resizeMode: 'center', width: 54, height: 54, margin: '3%'}}
                  source={require('./circle.png')}
                />
              </TouchableOpacity>}

              {this.state.extrusionShape === 1 ? <TouchableOpacity style={{position: 'relative', top: 0, left: 0}} onPress={() => {this.changeShape(1)}}>
                <Image
                  style={{resizeMode: 'center', width: 54, height: 54, margin: '3%'}}
                  source={require('./triangle_alt.png')}
                />
              </TouchableOpacity> : <TouchableOpacity style={{position: 'relative', top: 0, left: 0}} onPress={() => {this.changeShape(1)}}>
                <Image
                  style={{resizeMode: 'center', width: 54, height: 54, margin: '3%'}}
                  source={require('./triangle.png')}
                />
              </TouchableOpacity>}

              {this.state.extrusionShape === 2 ? <TouchableOpacity style={{position: 'relative', top: 0, left: 0}} onPress={() => {this.changeShape(2)}}>
                <Image
                  style={{resizeMode: 'center', width: 54, height: 54, margin: '3%'}}
                  source={require('./square_alt.png')}
                />
              </TouchableOpacity> : <TouchableOpacity style={{position: 'relative', top: 0, left: 0}} onPress={() => {this.changeShape(2)}}>
                <Image
                  style={{resizeMode: 'center', width: 54, height: 54, margin: '3%'}}
                  source={require('./square.png')}
                />
              </TouchableOpacity>}

              {this.state.extrusionShape === 3 ? <TouchableOpacity style={{position: 'relative', top: 0, left: 0}} onPress={() => {this.changeShape(3)}}>
                <Image
                  style={{resizeMode: 'center', width: 54, height: 54, margin: '3%'}}
                  source={require('./tube_alt.png')}
                />
              </TouchableOpacity> : <TouchableOpacity style={{position: 'relative', top: 0, left: 0}} onPress={() => {this.changeShape(3)}}>
                <Image
                  style={{resizeMode: 'center', width: 54, height: 54, margin: '3%'}}
                  source={require('./tube.png')}
                />
              </TouchableOpacity>}

              {this.state.extrusionShape === 4 ? <TouchableOpacity style={{position: 'relative', top: 0, left: 0}} onPress={() => {this.changeShape(4)}}>
                <Image
                  style={{resizeMode: 'center', width: 54, height: 54, margin: '3%'}}
                  source={require('./slash_alt.png')}
                />
              </TouchableOpacity> : <TouchableOpacity style={{position: 'relative', top: 0, left: 0}} onPress={() => {this.changeShape(4)}}>
              <Image
                style={{resizeMode: 'center', width: 54, height: 54, margin: '3%'}}
                source={require('./slash.png')}
              />
            </TouchableOpacity>}
            </View>

            <Text style={{left: '6%', fontFamily: 'Roboto', fontSize: 18}}>Material</Text>
            <View style={{flex: 0.05}} />
            <View style={{flexDirection: 'row', flex: 0.5}}>
              <View style={{width: '5%'}}/>
              {this.state.extrusionMaterial === 0 ? <TouchableOpacity style={{position: 'relative', top: 0, left: 0}} onPress={() => {this.changeMaterial(0)}}>
                <Image
                  style={{resizeMode: 'cover', width: 54, height: 54, margin: '3%'}}
                  source={require('./basic_material_alt.png')}
                />
              </TouchableOpacity> : <TouchableOpacity style={{position: 'relative', top: 0, left: 0}} onPress={() => {this.changeMaterial(0)}}>
                <Image
                  style={{resizeMode: 'cover', width: 54, height: 54, margin: '3%'}}
                  source={require('./basic_material.png')}
                />
              </TouchableOpacity>}

              {this.state.extrusionMaterial === 1 ? <TouchableOpacity style={{position: 'relative', top: 0, left: 0}} onPress={() => {this.changeMaterial(1)}}>
                <Image
                  style={{resizeMode: 'cover', width: 54, height: 54, margin: '3%'}}
                  source={require('./lambert_material_alt.png')}
                />
              </TouchableOpacity> : <TouchableOpacity style={{position: 'relative', top: 0, left: 0}} onPress={() => {this.changeMaterial(1)}}>
                <Image
                  style={{resizeMode: 'cover', width: 54, height: 54, margin: '3%'}}
                  source={require('./lambert_material.png')}
                />
              </TouchableOpacity>}

              {this.state.extrusionMaterial === 2 ? <TouchableOpacity style={{position: 'relative', top: 0, left: 0}} onPress={() => {this.changeMaterial(2)}}>
                <Image
                  style={{resizeMode: 'cover', width: 54, height: 54, margin: '3%'}}
                  source={require('./metal_material_alt.png')}
                />
              </TouchableOpacity> : <TouchableOpacity style={{position: 'relative', top: 0, left: 0}} onPress={() => {this.changeMaterial(2)}}>
                <Image
                  style={{resizeMode: 'cover', width: 54, height: 54, margin: '3%'}}
                  source={require('./metal_material.png')}
                />
              </TouchableOpacity>}

              {this.state.extrusionMaterial === 3 ? <TouchableOpacity style={{position: 'relative', top: 0, left: 0}} onPress={() => {this.changeMaterial(3)}}>
                <Image
                  style={{resizeMode: 'cover', width: 54, height: 54, margin: '3%'}}
                  source={require('./transparent_material_alt.png')}
                />
              </TouchableOpacity> : <TouchableOpacity style={{position: 'relative', top: 0, left: 0}} onPress={() => {this.changeMaterial(3)}}>
                <Image
                  style={{resizeMode: 'cover', width: 54, height: 54, margin: '3%'}}
                  source={require('./transparent_material.png')}
                />
              </TouchableOpacity>}

              {this.state.extrusionMaterial === 4 ? <TouchableOpacity style={{position: 'relative', top: 0, left: 0}} onPress={() => {this.changeMaterial(4)}}>
                <Image
                  style={{resizeMode: 'cover', width: 54, height: 54, margin: '3%'}}
                  source={require('./normal_material_alt.png')}
                />
              </TouchableOpacity> : <TouchableOpacity style={{position: 'relative', top: 0, left: 0}} onPress={() => {this.changeMaterial(4)}}>
              <Image
                style={{resizeMode: 'cover', width: 54, height: 54, margin: '3%'}}
                source={require('./normal_material.png')}
              />
            </TouchableOpacity>}
            </View>

            <View
              style={{flex: 0.25}}
            />

            <Button
               style={{position: 'relative', bottom: '30%'}}
               backgroundColor="#aaa"
               title="EXTRUDE"
               onPress={() => {this.showColorPicker()}}
             />
         </View> : null }

         <Expo.GLView
           {...this.panResponder.panHandlers}
           ref={(ref) => this._glView = ref}
           style={styles[this.state.arDisplay]}
           onContextCreate={this._onGLContextCreate}
         />
         {this.state.showColorPicker || this.state.showInfo ? null : <View>

           <TouchableOpacity style={{position: 'absolute', bottom: 25, left: 30}} onPress={() => {this.showColorPicker()}}>
             <Image
               style={{width: 30, height: 30}}
               source={require('./settings_icon.png')}
             />
           </TouchableOpacity>

           <TouchableOpacity style={{position: 'absolute', bottom: 27.5, left: 85}} onPress={() => {this.showInfo()}}>
             <Image
               style={{resizeMode: 'contain', height: 25}}
               source={require('./info_icon.png')}
             />
           </TouchableOpacity>

           <TouchableOpacity style={{position: 'absolute', bottom: 15, left: 180}} onPress={() => {this._saveToCameraRollAsync()}}>
             <Image
               style={{width: 50, height: 50}}
               source={require('./camera_icon.png')}
             />
           </TouchableOpacity>

           <TouchableOpacity style={{position: 'absolute', bottom: 25, left: 275}} onPress={() => {this.removeLastChild()}}>
             <Image
               style={{width: 30, height: 30}}
               source={require('./revert_icon.png')}
             />
           </TouchableOpacity>

           <TouchableOpacity style={{position: 'absolute', bottom: 25, left: 350}} onPress={() => {this.clearScene()}}>
             <Image
               style={{width: 30, height: 30}}
               source={require('./clear_icon.png')}
             />
           </TouchableOpacity>

         </View> }
       </View>
     )
   }

  _onGLContextCreate = async (gl) => {
    const arSession = await this._glView.startARSessionAsync();
    const scene = new THREE.Scene();
    const camera = ExpoTHREE.createARCamera(
      arSession,
      gl.drawingBufferWidth,
      gl.drawingBufferHeight,
      0.01,
      1000
    );
    const renderer = ExpoTHREE.createRenderer({ gl, antialias: true,
    alpha: true });
    renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);
    scene.background = ExpoTHREE.createARBackgroundTexture(arSession, renderer);

    let vector = new THREE.Vector3()
    const {
      ambientIntensity,
      ambientColorTemperature,
    } = ExpoTHREE.getARLightEstimation(arSession);

    let light = new THREE.DirectionalLight( 0xffffff, .75 );
    light.position.set( 0, 1, 0 );
    scene.add( light );

    var light1 = new THREE.AmbientLight( 0x404040 ); // soft white light
    scene.add( light1 );

    let light2 = new THREE.DirectionalLight( 0xffffff, 0.1 );
    light2.position.set( 0, 0, 1 );
    scene.add( light2 );

    let light3 = new THREE.DirectionalLight( 0xffffff, 0.1 );
    light3.position.set( 1, 0, 0 );
    scene.add( light3 );

    let light4 = new THREE.DirectionalLight( 0xffffff, 0.1 );
    light4.position.set( -1, 0, 0 );
    scene.add( light4 );

    let light5 = new THREE.DirectionalLight( 0xffffff, 0.1 );
    light5.position.set( 0, 0, -1 );
    scene.add( light5 );

    let newCurve
    const _addCurve = () => {
      if(this.state.drawCurve){
        newCurve = new THREE.CatmullRomCurve3([], false, 'centripetal', 1);
        newCurve.points.push(vector)
        this.setState({previousPoint: vector})
        this.setState({drawCurve: !this.state.drawCurve})
      } else {
          if(vector.distanceTo(this.state.previousPoint) > 0.005){
            newCurve.points.push(vector)
            this.setState({previousPoint: vector})

            if (newCurve.points.length > 0) {
              let circleRadius = this.state.size
              let squareEdge = this.state.size
              let triangleEdge = this.state.size
              var shape = new THREE.Shape()

              if (this.state.shape === 'circle'){
                shape.absarc( 0, 0, circleRadius, 0, Math.PI * 2, false )
              } else if (this.state.shape === 'square'){
                shape.moveTo( 0, 0 );
                shape.lineTo( 0, squareEdge );
                shape.lineTo( squareEdge, squareEdge );
                shape.lineTo( squareEdge, 0 );
                shape.lineTo( 0, 0 );
              } else if (this.state.shape === 'triangle'){
                shape.moveTo( 0.5 * triangleEdge, 0  );
                shape.lineTo( 0.5*triangleEdge, Math.sqrt((Math.pow(triangleEdge, 2) - (0.25 * (Math.pow(triangleEdge, 2))))) );
                shape.lineTo( -triangleEdge, 0 );
                shape.lineTo( 0.5*triangleEdge, -Math.sqrt((Math.pow(triangleEdge, 2) - (0.25 * (Math.pow(triangleEdge, 2))))) );
                // shape.lineTo( 0.5*triangleEdge, Math.sqrt((Math.pow(triangleEdge, 2) - (0.25 * (Math.pow(triangleEdge, 2))))) );
              } else if (this.state.shape === 'tube'){
                shape.absarc( 0, 0, circleRadius, 0, Math.PI * 2, false )
                let holePath = new THREE.Path();
                holePath.absarc( 0, 0, circleRadius - (0.05 * circleRadius), 0, Math.PI * 2, false);
                shape.holes.push( holePath );
              } else if (this.state.shape === 'slash'){
                shape.moveTo( 0, 0 );
                shape.lineTo( squareEdge, squareEdge );
              }
              let extrudeSettings = {
                steps: 5*newCurve.points.length,
                bevelEnabled: false,
                extrudePath: newCurve,
                curveSegments: 20,
                material: 0,
                extrudeMaterial: 1
              };

              let geometry = new THREE.ExtrudeGeometry( shape, extrudeSettings )
              geometry.mergeVertices()
              // geometry.computeBoundingBox();
              // geometry.computeVertexNormals()
              // for ( let i = 0; i < geometry.faces.length; i ++ ) {
              //   var face = geometry.faces[ i ];
              //   if (face.materialIndex == 1 ) {
              //     for ( var j = 0; j < face.vertexNormals.length; j ++ ) {
              //       face.vertexNormals[ j ].z = 0;
              //       face.vertexNormals[ j ].normalize();
              //     }
              //   }
              // }

              let color = new THREE.Color(`rgb(${this.state.color.r}, ${this.state.color.g}, ${this.state.color.b})`)

              if(this.state.material === 'lambert'){
                // material = new THREE.MultiMaterial([
                //   new THREE.MeshLambertMaterial( { color: color, shading: THREE.FlatShading } ), // front
                //   new THREE.MeshLambertMaterial( { color: color, shading: THREE.SmoothShading } )
                // ]);
                material = new THREE.MeshLambertMaterial( { color: color, shading: THREE.SmoothShading } )
              } else if(this.state.material === 'basic'){
                material = new THREE.MeshBasicMaterial( { color: color, shading: THREE.SmoothShading } )
              } else if(this.state.material === 'metal'){
                material = new THREE.MeshStandardMaterial( { color: color, metalness: 1, shading: THREE.SmoothShading } )
              } else if(this.state.material === 'normal'){
                material = new THREE.MeshNormalMaterial( { color: color, clearCoat: 1, clearCoatRoughness: 0.1, shading: THREE.SmoothShading } )
              } else if(this.state.material === 'transparent'){
                material = new THREE.MeshStandardMaterial( { color: color, transparent: true, opacity: 0.75, shading: THREE.SmoothShading} )
              }

              let mesh = new THREE.Mesh( geometry, material )
              scene.add(mesh)
              this.setState({previousMesh: mesh})
              if(!this.state.released && this.state.previousMesh){
                scene.remove(this.state.previousMesh)
              }
            }
          }
        }
      }

    const animate = () => {
      requestAnimationFrame(animate);
      camera.position.setFromMatrixPosition(camera.matrixWorld);
      vector = new THREE.Vector3(0, 0, 0);
      vector.applyMatrix4(camera.matrixWorld);
      if (this.state.released){
        _addCurve()
        this.setState({released: false})
      }

      if(this.state.clearScene){

        for(let i = scene.children.length; i > 5; i--){
          scene.remove(scene.children[i])
        }
        this.setState({clearScene: false})
      }
      if(this.state.removeLastChild){
        if(!scene.children[scene.children.length - 1].isLight){
          scene.remove(scene.children[scene.children.length - 1])
          this.setState({removeLastChild: false})
        }
      }
      if(this.touching){
        _addCurve()
      }
      renderer.render(scene, camera);
      gl.endFrameEXP();
    }
    animate();
  }
}

let mapThis = function (num, inMin, inMax, outMin, outMax) {
    return (num - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
  }

function round(n) {
  if (!n) {
    return 0;
  }
  return Math.floor(n * 100) / 100;
}

const styles = StyleSheet.create({
    container: {
      flex:1,
      overflow: 'hidden',
  },
  hiddenContainer: {
    top: window.height,
    bottom: -window.height
  }
});
