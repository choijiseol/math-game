'use client';

import {STAGE_CONFIGS} from '@/lib/stageConfigs';
import Flex from "@/components/Flex";
import styled from "styled-components";

interface Props {
    maxUnlocked: number;
    onSelect: (stage: number) => void;
    onBack: () => void;
}

export default function StageSelect({maxUnlocked, onSelect, onBack}: Props) {
    return <Wrapper width={"100vw"} height={"100vh"} gap={20} style={{backgroundColor: "#9ADDFF"}}>
        <Flex width={60} height={60} center style={{cursor: "pointer", marginTop: 24, marginLeft: 24}} onClick={onBack}>
            <img src={"/assets/img/icon-back.svg"} alt="back"/>
        </Flex>
        <div className="grid grid-cols-4 gap-3 px-4 pb-8 w-fit self-center">
            {STAGE_CONFIGS.map(({stage}) => {
                const unlocked = stage <= maxUnlocked;

                return <StageButton
                    key={stage}
                    center
                    unlocked={unlocked}
                    onClick={unlocked ? () => onSelect(stage) : undefined}
                >
                    {unlocked
                        ? <span>{stage}</span>
                        : <img src={"/assets/img/icon-lock.svg"} width={40} height={40} alt="locked"/>
                    }
                </StageButton>
            })}
        </div>
    </Wrapper>
}

const Wrapper = styled(Flex)`
    background-image: url("/assets/img/back-bubble.svg");
    background-size: 467px auto;
    background-position: center;
    background-repeat: no-repeat;
    overflow-x: hidden;
    overflow-y: auto;
    justify-content: flex-start;
`;

const StageButton = styled(Flex)<{ unlocked: boolean }>`
    width: 80px;
    height: 80px;
    border-radius: 8px;
    font-weight: 700;
    font-size: 32px;
    transition: all 150ms ease-in-out;
    border: 3px solid #004F7F;
    cursor: ${({unlocked}) => unlocked ? 'pointer' : 'not-allowed'};
    background-color: ${({unlocked}) => unlocked ? '#FFFFFF' : 'rgba(0, 0, 0, 0.3)'};
    color: #004F7F;
    box-shadow: ${({unlocked}) => unlocked ? '0 1px 2px 0 rgba(0, 0, 0, 0.05)' : 'none'};

    &:hover {
        ${({unlocked}) => unlocked ? 'transform: scale(1.05);' : ''}
    }

    &:active {
        ${({unlocked}) => unlocked ? 'transform: scale(0.95);' : ''}
    }
`;