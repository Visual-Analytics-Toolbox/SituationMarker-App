# Situation Marker App

## Android
Check if device is found by your dev environment:
```bash
adb devices -l
```
There is a difference between npx expo run:android and npm run android

on phone set usb mode

npx expo run:android --device
> select your phone


# Make udp work in dev
npx expo start --tunnel

## Build Production
npx expo prebuild
npx expo run:android --variant release