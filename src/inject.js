const speechSynthesis = window.speechSynthesis;

const phoneticAlphabet = {
  a: "Alfa",
  b: "Bravo",
  c: "Charlie",
  d: "Delta",
  e: "Echo",
  f: "Foxtrot",
  g: "Golf",
  h: "Hotel",
  i: "India",
  j: "Juliett",
  k: "Kilo",
  l: "Lima",
  m: "Mike",
  n: "November",
  o: "Oscar",
  p: "Papa",
  q: "Quebec",
  r: "Romeo",
  s: "Sierra",
  t: "Tango",
  u: "Uniform",
  v: "Victor",
  w: "Whiskey",
  x: "Xray",
  y: "Yankee",
  z: "Zulu",
};

const pauseString = " . ! ";

// { internalVoice, rate, pitch, volume }
const voicesByFlightId = {};

const getRandomFloat = (min, max, decimals) => {
  const str = (Math.random() * (max - min) + min).toFixed(decimals);

  return parseFloat(str);
};

let allVoices = speechSynthesis.getVoices();

const addMissingInternalVoices = () => {
  let missingCount = 0;

  for (const flightId in voicesByFlightId) {
    const voiceInfo = voicesByFlightId[flightId];

    if (!voiceInfo.internalVoice) {
      missingCount++;
      const newVoiceInfo = {
        ...voiceInfo,
        internalVoice: getRandomInternalVoice(),
      };
      voicesByFlightId[flightId] = newVoiceInfo;
    }
  }

  console.debug(`fixed up ${missingCount} missing internal voices`);
};

const populateVoiceList = () => {
  allVoices = speechSynthesis.getVoices();
  addMissingInternalVoices();
  console.debug(
    `voice list has been populated with ${allVoices.length} voices`
  );
};

const getRandomInternalVoice = () => {
  if (!allVoices.length) {
    return null;
  }

  let voicesToRandomize = [...allVoices];

  // we are always the first one
  voicesToRandomize = voicesToRandomize.slice(0, 1);

  return voicesToRandomize.sort(() => 0.5 - Math.random())[0];
};

const createRandomVoice = () => {
  const internalVoice = getRandomInternalVoice();

  const voice = {
    internalVoice,
    rate: getRandomFloat(1, 1.5, 2),
    pitch: getRandomFloat(0.25, 1.25, 2),
    volume: getRandomFloat(0.5, 1, 2),
  };

  return voice;
};

const createOurVoice = () => {
  const internalVoice = allVoices[0];

  console.debug(`our voice:`, internalVoice);

  const voice = {
    internalVoice,
    rate: 4,
    pitch: 0.01,
    volume: 0.25,
  };

  return voice;
};

const getVoiceForFlightId = (flightId) => {
  if (flightId in voicesByFlightId) {
    return voicesByFlightId[flightId];
  }
  return null;
};

const storeVoiceForFlightId = (flightId, voice) => {
  voicesByFlightId[flightId] = voice;
};

const isCharALetter = (char) => /^[a-z]/i.test(char);

const isCharANumber = (char) => /^\d$/.test(char);

const getPhoneticCharForChar = (char) => phoneticAlphabet[char];

const getPhoneticFlightId = (flightId) => {
  const chars = flightId.split("").map((char) => char.toLowerCase());
  const firstNumberIndex = chars.findIndex((char) => isCharANumber(char));
  const letterChars = chars.slice(0, firstNumberIndex);
  const numberChars = chars.slice(firstNumberIndex);

  const phoneticResults = [];

  for (const letterChar of letterChars) {
    const phoneticResult = getPhoneticCharForChar(letterChar);
    phoneticResults.push(phoneticResult);
  }

  let phoneticFlightId = "";

  phoneticFlightId += phoneticResults.join(" ");
  phoneticFlightId += " , ";
  phoneticFlightId += numberChars.join(" ");

  return phoneticFlightId;
};

const getPhoneticRunway = (runway) => {
  const chars = runway.split("").map((char) => char.toLowerCase());

  const phoneticResults = [];

  for (const char of chars) {
    let phoneticResult;

    if (isCharANumber(char)) {
      phoneticResult = char;
    } else {
      switch (char) {
        case "l":
          phoneticResult = "left";
          break;
        case "c":
          phoneticResult = "center";
          break;
        case "r":
          phoneticResult = "right";
          break;
        default:
          throw new Error(`Weird character: "${char}"`);
      }
    }

    phoneticResults.push(phoneticResult);
  }

  const result = phoneticResults.join(" ");

  return result;
};

const speak = (voice, text) => {
  return new Promise((resolve) => {
    console.debug(`speak "${text}"`, voice);

    if (!allVoices.length) {
      console.warn("Cannot speak without any voices");
    }

    const message = new SpeechSynthesisUtterance(text);

    if (!voice.internalVoice) {
      throw new Error(`Voice has no internal voice`);
    }

    message.voice = voice.internalVoice;
    message.rate = voice.rate;
    message.pitch = voice.pitch;
    message.volume = voice.volume;

    message.addEventListener("end", () => resolve());

    speechSynthesis.speak(message);
  });
};

const stopTalking = () => {
  speechSynthesis.cancel();
};

const onStatusBarChangedWithText = (callback) => {
  const targetNode = document.querySelector("#statusbar");

  const observer = new MutationObserver((mutationsList) => {
    for (let mutation of mutationsList) {
      if (mutation.type === "childList") {
        callback(targetNode.innerText);
      }
    }
  });

  observer.observe(targetNode, { childList: true });
};

const getRunwayStringFromText = (text) => {
  const chunks = text.toLowerCase().split("runway");
  const chunkAfterRunway = chunks[1];
  const chunksBySpace = chunkAfterRunway.split(" ");
  const runwayName = chunksBySpace[1].replaceAll(".", "").replaceAll(",", "");
  return runwayName;
};

const getRunwayNameFromText = (text) => {
  const chunks = text.toLowerCase().split("runway");
  const chunkAfterRunway = chunks[1];
  const chunksBySpace = chunkAfterRunway.split(" ");
  const runwayName = chunksBySpace[1].replaceAll(".", "").replaceAll(",", "");
  return runwayName;
};

const getDegreesFromText = (text) => {
  const chunks = text.toLowerCase().split("heading");
  const chunkAfterHeading = chunks[1];
  const chunksBySpace = chunkAfterHeading.split(" ");
  const degrees = chunksBySpace[1].replaceAll(".", "").replaceAll(",", "");
  return degrees;
};

const getPhoneticDegrees = (degreesText) => {
  const digits = degreesText.replaceAll("°", "");
  const digitsBySpace = digits.split("").join(" ");
  return digitsBySpace;
};

const getPhoneticMessage = (statusBarText) => {
  const chunks = statusBarText.split(": ");
  const flightId = chunks[0].toLowerCase();
  const message = chunks[1].toLowerCase();
  let phoneticMessage = "";

  const phoneticFlightId = getPhoneticFlightId(flightId);

  phoneticMessage += phoneticFlightId;
  phoneticMessage += pauseString;

  if (message.includes("must be no higher")) {
    phoneticMessage += "we are not ready to intercept the runway";
  } else if (message.includes("entering terminal area")) {
    phoneticMessage += "ready for approach";
  } else if (message.includes("fly heading")) {
    const degreesString = getDegreesFromText(message);
    const phoneticDegrees = getPhoneticDegrees(degreesString);

    phoneticMessage += message.replace(degreesString, phoneticDegrees);
  } else if (message.includes("runway")) {
    const runwayString = getRunwayNameFromText(message);
    const runwayName = getRunwayNameFromText(message);
    const phoneticRunway = getPhoneticRunway(runwayName);

    phoneticMessage += message.replace(runwayString, phoneticRunway);
  } else {
    phoneticMessage += message;
  }

  return phoneticMessage;
};

const getFlightIdFromStatusBarText = (statusBarText) => {
  const chunks = statusBarText.split(":");
  const flightId = chunks[0];
  return flightId;
};

const onNewIncomingRadioMessage = (statusBarText) => {
  const flightId = getFlightIdFromStatusBarText(statusBarText);

  const nextMessageToSpeak = getPhoneticMessage(statusBarText);

  let voiceForFlightId = getVoiceForFlightId(flightId);

  if (!voiceForFlightId) {
    voiceForFlightId = createRandomVoice();
    storeVoiceForFlightId(flightId, voiceForFlightId);
  }

  speak(voiceForFlightId, nextMessageToSpeak);
};

const internalMessages = [
  "line up and wait",
  "and maintain",
  "fly heading",
  "cleared to",
  "cleared for",
  "vector to",
  "speed to",
  "hold at",
  "abort",
];

const getIsOurselves = (statusBarText) => {
  for (const internalMessage of internalMessages) {
    if (statusBarText.toLowerCase().includes(internalMessage)) {
      return true;
    }
  }

  return false;
};

let ourVoice;

const onNewMessageFromOurselves = (messageWithFlightId) => {
  const nextMessageToSpeak = getPhoneticMessage(messageWithFlightId);

  if (!ourVoice) {
    console.debug(`creating our voice...`);
    ourVoice = createOurVoice();
  }

  speak(ourVoice, nextMessageToSpeak);
};

const getStripsContainer = () => {
  return document
    .querySelector('iframe[name="ProgressStrips"]')
    .contentWindow.document.querySelector("#strips");
};

let stripsContainer;

// not in use as after a flight spawns in, it takes a second for the iframe to update, so not that useful for speed
const getPlaneStatusByFlightId = (flightId) => {
  // takes a moment to load iframe
  if (!stripsContainer) {
    stripsContainer = getStripsContainer();
  }

  const strip = stripsContainer.querySelector(`#${flightId}`);

  if (strip === null) {
    // throw new Error(`Could not get plane status by flight ID "${flightId}"`);
    console.warn(`could not get plane status by flight ID "${flightId}"`);
    return;
  }

  const statusText = strip.querySelector(".info").innerText;
  const firstLine = statusText.split("\n")[0];
  const chunks = firstLine.split("\u00A0").map((chunk) => chunk.trim());
  const headingWithDegrees = chunks[1];
  const altitudeWithState = chunks[2];

  return {
    flightId,
    heading: headingWithDegrees,
    altitude: altitudeWithState,
  };
};

const messagesToIgnore = [
  "invalid flight id",
  "invalid command",
  "you must first assign",
  "improper exit",
];

(() => {
  console.log("Starting up atc-sim Speech");

  // initial load there are no voices until a second later
  speechSynthesis.onvoiceschanged = populateVoiceList;

  onStatusBarChangedWithText((statusBarText) => {
    console.debug(`new status bar text: ${statusBarText}`);

    const message = statusBarText.split(":")[1];

    if (message === "") {
      console.warn("no message contents");
      return;
    }

    for (const messageToIgnore of messagesToIgnore) {
      if (statusBarText.toLowerCase().includes(messageToIgnore)) {
        console.warn(`ignoring message`);
        return;
      }
    }

    const isOurselves = getIsOurselves(statusBarText);

    if (isOurselves) {
      onNewMessageFromOurselves(statusBarText);
    } else {
      onNewIncomingRadioMessage(statusBarText);
    }
  });
})();
