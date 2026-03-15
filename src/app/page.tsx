'use client';

import {useState} from 'react';
import GameScreen from '@/components/GameScreen';
import StageSelect from '@/components/StageSelect';
import {getMaxUnlocked, completeStage} from '@/lib/progress';
import {TOTAL_STAGES} from '@/lib/stageConfigs';
import Flex from "@/components/Flex";
import styled from "styled-components";

type Screen = 'home' | 'stageSelect' | 'game';

export default function Home() {
    const [screen, setScreen] = useState<Screen>('home');
    const [selectedStage, setSelectedStage] = useState(1);
    const [maxUnlocked, setMaxUnlocked] = useState(() => getMaxUnlocked());

    function handleStageComplete() {
        setMaxUnlocked(completeStage(selectedStage));
    }

    function handleNextStage() {
        const next = selectedStage + 1;
        if (next <= TOTAL_STAGES) {
            setSelectedStage(next); // GameScreen remounts via key={selectedStage}
        } else {
            setScreen('stageSelect');
        }
    }

    if (screen === 'stageSelect') {
        return <StageSelect
            maxUnlocked={maxUnlocked}
            onSelect={(stage) => {
                setSelectedStage(stage);
                setScreen('game');
            }}
            onBack={() => setScreen('home')}
        />
    }

    if (screen === 'game') {
        return <GameScreen
            key={selectedStage}
            stage={selectedStage}
            onExit={() => setScreen('stageSelect')}
            onComplete={handleStageComplete}
            onNextStage={handleNextStage}
        />
    }

    return <Wrapper center width={"100vw"} height={"100vh"} style={{backgroundColor: "#9ADDFF"}}>
        <Flex gap={20} center>
            <span style={{fontSize: 40, fontWeight: 700, color: "#004F7F"}}>버블팡</span>
            <StartButton center onClick={() => setScreen('stageSelect')}>
                시작하기
            </StartButton>
        </Flex>
    </Wrapper>
}

const Wrapper = styled(Flex)`
    background-image: url("/assets/img/back-bubble.svg");
    background-size: 467px auto;
    background-position: center;
    background-repeat: no-repeat;
    overflow-x: hidden;
`

const StartButton = styled(Flex)`
    width: 200px;
    height: 60px;
    background-color: #004F7F;
    border-radius: 100px;
    cursor: pointer;

    font-size: 32px;
    font-weight: 700;
    color: #FFFFFF;

`