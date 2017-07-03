import React, { Component, PropTypes } from 'react';
import ReactCrop from 'react-image-crop';
// import axios from 'axios';
import $ from "jquery";

export default class ImageCropApp extends Component {
  constructor( props ) {
    super( props );
    this.state = {
      avatar: '',
      crop: {
        width: 50,
        minWidth: 50,
        aspect: 3/4
      },
      userCrop: {},
      cropImg: '',
      resizeUrl: ''
    }
  }

  componentDidMount() {
    this.onResize( '128', '128' );
  }

  shouldComponentUpdate(nextProps, nextState) {
    if ( this.state.avatar !== nextState.avatar )
      return true;
    if ( this.state.resizeUrl !== nextState.resizeUrl )
      return true;
    return false;
  }

  handleUpload = e => {
    let file = e.target.files[0];
    let reader = new FileReader();
    reader.onloadend = () => {
      // console.log( reader );
      this.setState({
        avatar: reader.result
      });
    }

    reader.readAsDataURL(file);
    // console.log( this.state );
  }

  onImageLoaded = (crop, image, pixelCrop) => {
    this.setState({
      userCrop: pixelCrop
    }, () => this.cropImage());
  }

  onComplete = (crop, pixelCrop) => {
    // console.log( crop, pixelCrop );
    this.setState({
      userCrop: pixelCrop
    });
  }

  loadImageToCrop = (src, callback) => {
    let image = new Image();
    image.onload = function(e) {
      // console.log( image );
      callback(image);
      image = null;
    };

    image.src = src;
  }

  cropImage = () => {
    let imgDest = this.refs.crop;
    let crop = this.state.userCrop;
    // console.log( crop );
    this.loadImageToCrop( this.state.avatar , cropAfterLoad.bind( this ));

    function cropAfterLoad(loadedImg) {
      let imageWidth = loadedImg.naturalWidth;
      let imageHeight = loadedImg.naturalHeight;

      let cropX = crop.x;
      let cropY = crop.y;

      let cropWidth = crop.width;
      let cropHeight = crop.height;

      let canvas = document.createElement('canvas');
      canvas.width = cropWidth;
      canvas.height = cropHeight;
      let ctx = canvas.getContext('2d');

      ctx.drawImage(loadedImg, cropX, cropY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);

      if (HTMLCanvasElement.prototype.toBlob) {
        console.info('It looks like Chrome now supports HTMLCanvasElement.toBlob.. time to uncomment some code!');
      }

      // canvas.toBlob will be faster and non-blocking but is currently only supported in FF.
      // canvas.toBlob(function(blob) {
      // 	let url = URL.createObjectURL(blob);

      // 	imgDest.onload = function() {
      // 		URL.revokeObjectURL(url);
      // 		this.ready();
      // 	};

      // 	imgDest.src = url;
      // });

      imgDest.src = canvas.toDataURL('image/jpeg');
    }
  }

  onSave = () => {
    // console.log( this.refs.crop );
    $.ajax({
      url: 'http://localhost:9000/pictures/upload',
      type: 'POST',
      data: {
        img: this.refs.crop.src
      },
      success: function( res ) {
        // console.log( res );
        alert( 'Upload crop image success!' );
      },
      error: function( err ) {
        console.error( err );
      }
    })
    // axios.post('http://localhost:7000/pictures/upload', {
    //   img: this.refs.crop.src
    // })
    // .then(function (response) {
    //   console.log(response);
    // })
    // .catch(function (error) {
    //   console.log(error);
    // });
  }

  onResize = ( w, h ) => {
    let that = this;
    $.ajax({
      url: `http://localhost:9000/pictures/img?w=${w}&h=${h}`,
      type: 'GET',
      success( res ) {
        // console.log( res );
        if ( res.status === 200 )
          that.setState({
            resizeUrl: res.img + '?time=' + new Date()
          });
      },
      error( err ) {
        console.error( error );
      }
    })
  }

  render() {
    return (
      <div className="app container-fluid">
        <div className="row">
          <div className="col-sm-12 text-center">
            <label htmlFor="avatar" className="btn btn-sm btn-danger mg-5">
              Upload
            </label>
            <input
              type="file"
              id="avatar"
              name="avatar"
              accept="image/*"
              className="hidden"
              onChange={ this.handleUpload } />
          </div>
        </div>
        <div className="row">
          <div className="col-sm-4 col-sm-offset-2 text-center">
            <ReactCrop
              className="img"
              src={ this.state.avatar }
              crop={ this.state.crop }
              onComplete={ this.onComplete }
              onImageLoaded = { this.onImageLoaded } />
          </div>
          <div className="col-sm-4 col-sm-offset-1 text-center">
            <img src="" ref="crop" className="img"/>
          </div>
        </div>
        <div className="row">
          <div className="col-sm-12 text-center mg-5">
            <button type="button"
              className="btn btn-sm btn-default"
              onClick={ this.cropImage }>
              Crop
            </button>
            <button type="button"
              className="btn btn-sm btn-primary"
              onClick={ this.onSave }>
              Save
            </button>
          </div>
        </div>
        <div className="row">
          <div className="col-sm-12 text-center mg-5">
            <button type="button" className="btn btn-sm btn-default" onClick={ () => this.onResize('128', '128') }> 128x128 </button>
            <button type="button" className="btn btn-sm btn-default" onClick={ () => this.onResize('200', '200') }> 200x200 </button>
            <button type="button" className="btn btn-sm btn-default" onClick={ () => this.onResize('30', '30') }> 30x30 </button>
          </div>
          <div className="col-sm-12 text-center">
            <img ref="resize" src={ this.state.resizeUrl }/>
          </div>
        </div>
      </div>
    )
  }
}