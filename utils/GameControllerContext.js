import UdpSocket from 'react-native-udp';
import { parseGameControlData, parseGameControlReturnData } from './GameControlData';
import { useState, useEffect, useRef, useContext, createContext } from 'react';
import { sendHandshake } from './GameController';

const GameControllerContext = createContext(null);

export const GameControllerProvider = ({ children }) => {
    const [gcIP, setGcIP] = useState('10.12.156.98');
    const [monitor, setMonitor] = useState(false);

    const GameDataSocketRef = useRef(null);
    const RobotStatusSocketRef = useRef(null);
    const ipRef = useRef(null);
    const monitorRef = useRef(null);

    useEffect(() => {
        const GameDataSocket = UdpSocket.createSocket('udp4');

        GameDataSocket.on('message', (data, rinfo) => {
            const gameData = parseGameControlData(data);

            setGcIP(rinfo.address)

            if (gameData.header === 'RGme') {
                if (!ipRef.current) {
                    ipRef.current = rinfo.address;
                    setGcIP(rinfo.address);
                }

                if (!monitorRef.current) {
                    monitorRef.current = true;
                    setMonitor(true);

                    sendHandshake(rinfo.address, GameDataSocketRef);
                }
            }

            console.log(gameData)
        })

        GameDataSocket.on('error', (err) => {
            console.log('Socket Error:', err);
        });

        GameDataSocket.bind(3838);
        GameDataSocketRef.current = GameDataSocket;

        const RobotStatusSocket = UdpSocket.createSocket('udp4');

        RobotStatusSocket.on('message', (data, rinfo) => {

            const robotStatus = parseGameControlReturnData(data);

            if (robotStatus.header.search('RGrt') != -1) {
                console.log(robotStatus)
            }
        });

        RobotStatusSocket.on('error', (err) => {
            console.log('Socket Error:', err);
        });

        RobotStatusSocket.bind(3940);
        RobotStatusSocketRef.current = RobotStatusSocket;

        return () => {
            if (GameDataSocketRef.current) {
                GameDataSocketRef.current.close();
                GameDataSocketRef.current = null;
            }
            if (RobotStatusSocket.current) {
                RobotStatusSocket.current.close();
                RobotStatusSocket.current = null;
            }
        };

    }, [monitor]);

    return (
        <GameControllerContext.Provider value={{ gcIP, monitor }}>
            {children}
        </GameControllerContext.Provider>
    )
}

export const useGameController = () => useContext(GameControllerContext);