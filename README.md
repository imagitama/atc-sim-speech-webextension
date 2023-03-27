# atc-sim Speech WebExtension

A Chrome WebExtension that adds speech-to-text support to the [atc-sim](https://atc-sim.com) simulator.

It reads out every pilot communication (including your own) in different voices provided by your browser (my browser Opera has 5 possible voices) in the correct NATO phonetic alphabet.

## Usage

Tested in Opera.

1. Go to your browser extensions
2. Click "Load unpacked"
3. Find this repo sourcecode
4. Visit atc-sim, start a new simulation and it should start reading out all radio messages

## How it works

Your voice is always read back very quickly with a deep voice so you know it's yours.

Other pilots are random voices with different pitches, volumes and speeds. Their voices remains the same until the plane disappears from the simulator.

All voice messages are "queued up" as in they wait for the last message to finish before reading out the next one.

Some phrases are reworded to be more realistic:

| Original message                  | Read out as                              |
| --------------------------------- | ---------------------------------------- |
| Entering terminal area            | Ready for approach                       |
| Must be no higher than 3000 ft... | We are not ready to intercept the runway |

## Limitations/bugs/issues

The first message may not be read out.

If your command is invalid, nothing will be read out.

The extension relies on strings of characters in the correct position so if the atc-sim creator ever changes the simulator behavior, this extension could break.
