import "./App.css";
import React, { useState, useEffect } from "react";
import * as faceapi from "face-api.js";

function App() {
  const [image, setImage] = useState();
  const [modelLoaded, setModelLoaded] = useState(false); // [1
  const [editedImage, setEditedImage] = useState();
  const [hasLoaded, setHasLoaded] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
    // await faceapi.nets.ssdMobilenetv1.loadFromUri("/models");

    Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
      faceapi.nets.ssdMobilenetv1.loadFromUri("/models"),
    ]).then(() => {
      setModelLoaded(true);
    });
  }, []);

  // useEffect(() => {
  //   Promise.all([
  //     faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
  //     faceapi.nets.ssdMobilenetv1.loadFromUri("/models"),
  //   ]).then(() => {
  //     setModelLoaded(true);
  //   });
  // }, []);

  const handleImageUpload = event => {
    setHasLoaded(false);
    setEditedImage(null);
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onloadend = () => {
      setImage(reader.result);
    };

    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const addBeanie = async () => {
    const imageElement = document.createElement("img");
    imageElement.src = image;

    await imageElement.decode();

    const options = new faceapi.SsdMobilenetv1Options({ minConfidence: 0.1 });
    // const options = new faceapi.TinyFaceDetectorOptions({ minConfidence: 0.1 });
    const detections = await faceapi.detectAllFaces(imageElement, options);

    if (detections.length === 0) {
      setError("No faces detected");
      setHasLoaded(false);
      setEditedImage(null);
      setImage(null);
      return;
    }

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    canvas.width = imageElement.width;
    canvas.height = imageElement.height;
    context.drawImage(imageElement, 0, 0, canvas.width, canvas.height);

    const beanieImage = await loadImage("/blue_beanie.png");

    detections.forEach(detection => {
      const { x, y, width, height } = detection.box;

      const beanieAspect = beanieImage.width / beanieImage.height;
      const beanieWidth = width * 1.5; // Adjust the multiplier to change the size
      const beanieHeight = beanieWidth / beanieAspect;
      const beanieX = x - (beanieWidth - width) / 2;
      const beanieY = y - beanieHeight * 0.5; // Adjust multiplier to move beanie up

      context.drawImage(
        beanieImage,
        beanieX,
        beanieY,
        beanieWidth,
        beanieHeight
      );
    });

    setEditedImage(canvas.toDataURL());
    setHasLoaded(true);
  };

  const loadImage = src => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  };

  return (
    <div className="App p-4 sm:p-8 min-h-screen">
      <div className="flex justify-center mb-4">
        <img
          src="/blue_beanie.png"
          alt="Blue Beanie"
          className="w-32 sm:w-40"
        />
      </div>
      <h1 className="text-4xl md:text-6xl font-bold m-4">
        Blue Beanie Avatar Maker
      </h1>
      <p className="mb-2">
        Blue Beanie Day, held every November 30th since 2007, celebrates web
        standards and online accessibility.
      </p>
      <p className="mb-4">
        Upload a photo to add a blue beanie to the faces in the picture. Images
        are not stored.
      </p>
      <div className="flex justify-center">
        <div className="border-2 border-dashed border-gray-400 rounded-lg p-3 w-fit">
          {modelLoaded ? (
            <input type="file" accept="image/*" onChange={handleImageUpload} />
          ) : (
            <div>Loading...</div>
          )}
        </div>
      </div>
      {error && <div className="text-red-500 text-sm py-2">{error}</div>}
      <div className="flex justify-center mt-4 flex-wrap gap-4">
        <div>
          {image && (
            <img src={image} alt="Uploaded image" className="uploaded-image" />
          )}
          <button
            onClick={addBeanie}
            disabled={!image}
            className={
              "bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-2" +
              (!image || hasLoaded
                ? " opacity-50 cursor-not-allowed hidden"
                : "")
            }
          >
            Add Hat
          </button>
        </div>
        {editedImage && (
          <div>
            <img
              src={editedImage}
              alt="Edited image with a blue beanie"
              className="uploaded-image"
            />
            <a href={editedImage} download="edited-image.png">
              <button
                className={
                  "bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mt-2"
                }
              >
                Download
              </button>
            </a>
          </div>
        )}
      </div>
      <div className="mt-20">
        Created by{" "}
        <a
          href="https://twitter.com/stevefrenzel"
          target="_blank"
          rel="noreferrer"
          className="underline"
        >
          Elena Lape
        </a>
        . Source code on{" "}
        <a
          href="https://github.com/elenalape/blue-beanie-day"
          target="_blank"
          rel="noreferrer"
          className="underline"
        >
          GitHub
        </a>
        .
      </div>
    </div>
  );
}

export default App;
