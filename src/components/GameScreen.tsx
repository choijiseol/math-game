import styled, {keyframes} from 'styled-components';
import {useState, useEffect, useMemo} from 'react';
import {generatePuzzle} from '@/lib/gameUtils';
import {getStageConfig, TOTAL_STAGES} from '@/lib/stageConfigs';
import type {Bubble, GameResult} from '@/types/game';
import Flex from "@/components/Flex";

// ─── BubbleItem ───────────────────────────────────────────────────────────────

interface BubbleItemProps {
    bubble: Bubble;
    onClick: () => void;
    onFall: () => void;
    clickable: boolean;
    paused: boolean;
}

function BubbleItem({bubble, onClick, onFall, clickable, paused}: BubbleItemProps) {
    return <BubbleWrapper
        $left={bubble.x}
        $duration={bubble.duration}
        $delay={bubble.delay}
        $paused={paused}
        onAnimationEnd={paused ? undefined : onFall}
        onClick={clickable ? onClick : undefined}
    >
        <BubbleImage center>
            {bubble.operator}{bubble.value}
        </BubbleImage>
    </BubbleWrapper>
}

// ─── ResultOverlay ────────────────────────────────────────────────────────────

interface ResultOverlayProps {
    result: Exclude<GameResult, null>;
    stage: number;
    target: number;
    currentTotal: number;
    equationDisplay: string;
    onNextStage: () => void;
    onRetry: () => void;
    onExit: () => void;
}

function ResultOverlay({
                           result,
                           stage,
                           target,
                           currentTotal,
                           equationDisplay,
                           onNextStage,
                           onRetry,
                           onExit,
                       }: ResultOverlayProps) {
    return <Overlay>
        <OverlayCard center>
            {result === 'success'
                ? <Flex gap={40}>
                    <Flex center>
                        <ResultTitle $color="#004F7F">성공 🎉</ResultTitle>
                        <ResultDetail>{equationDisplay || '-'}</ResultDetail>
                    </Flex>
                    <Flex center gap={12}>
                        {stage < TOTAL_STAGES &&
                            <ActionButton $variant="primary" onClick={onNextStage}>
                                다음 단계
                            </ActionButton>
                        }
                        <ActionButton $variant="ghost" onClick={onExit}>
                            단계 선택
                        </ActionButton>
                    </Flex>
                </Flex>
                : <>
                    <ResultTitle $color="#F87171">실패💥</ResultTitle>
                    <ResultDetail>목표: {target}&nbsp;&nbsp;결과: {currentTotal}</ResultDetail>
                    <Flex center gap={12}>
                        <ActionButton $variant="primary" onClick={onRetry}>
                            다시 하기
                        </ActionButton>
                        <ActionButton $variant="ghost" onClick={onExit}>
                            단계 선택
                        </ActionButton>
                    </Flex>
                </>
            }
        </OverlayCard>
    </Overlay>
}

// ─── GameScreen ───────────────────────────────────────────────────────────────

interface Props {
    stage: number;
    onExit: () => void;
    onComplete: () => void;
    onNextStage: () => void;
}

export default function GameScreen({stage, onExit, onComplete, onNextStage}: Props) {
    const config = useMemo(() => getStageConfig(stage), [stage]);
    const [puzzle, setPuzzle] = useState(() => generatePuzzle(config));
    const [activeBubbles, setActiveBubbles] = useState<Bubble[]>(puzzle.bubbles);
    const [currentTotal, setCurrentTotal] = useState(0);
    const [equationParts, setEquationParts] = useState<string[]>([]);
    const [result, setResult] = useState<GameResult>(null);

    // Detect fail: all bubbles gone without reaching the target
    useEffect(() => {
        if (result !== null) return;
        if (activeBubbles.length === 0 && puzzle.bubbles.length > 0) {
            setResult('fail');
        }
    }, [activeBubbles.length, puzzle.bubbles.length, result]);

    function handleBubbleClick(bubble: Bubble) {
        if (result !== null) return;
        const delta = bubble.operator === '+' ? bubble.value : -bubble.value;
        const newTotal = currentTotal + delta;
        setCurrentTotal(newTotal);
        setEquationParts((prev) => [...prev, `${bubble.operator}${bubble.value}`]);
        setActiveBubbles((prev) => prev.filter((b) => b.id !== bubble.id));
        if (newTotal === puzzle.target) {
            setResult('success');
            onComplete();
        }
    }

    function handleBubbleFall(bubbleId: string) {
        setActiveBubbles((prev) => prev.filter((b) => b.id !== bubbleId));
    }

    function restartGame() {
        const newPuzzle = generatePuzzle(config);
        setPuzzle(newPuzzle);
        setActiveBubbles(newPuzzle.bubbles);
        setCurrentTotal(0);
        setEquationParts([]);
        setResult(null);
    }

    const equationDisplay = equationParts.join(' ');
    const isGameOver = result !== null;

    return <Container>
        <TargetBox center>
            {puzzle.target}
        </TargetBox>

        <RestartButton onClick={restartGame}>
            <img src="/assets/img/icon-again.svg" alt="Restart"/>
        </RestartButton>

        <EquationDisplay>
            현재 식 : {equationDisplay || '-'}
        </EquationDisplay>

        {activeBubbles.map((bubble) =>
            <BubbleItem
                key={bubble.id}
                bubble={bubble}
                onClick={() => handleBubbleClick(bubble)}
                onFall={() => handleBubbleFall(bubble.id)}
                clickable={!isGameOver}
                paused={isGameOver}/>
        )}

        {result &&
            <ResultOverlay
                result={result}
                stage={stage}
                target={puzzle.target}
                currentTotal={currentTotal}
                equationDisplay={equationDisplay}
                onNextStage={onNextStage}
                onRetry={restartGame}
                onExit={onExit}/>
        }
    </Container>
}

// ─── Styled Components ────────────────────────────────────────────────────────

const bubbleFall = keyframes`
    0% {
        top: -100px;
        opacity: 0;
    }
    10% {
        opacity: 1;
    }
    90% {
        opacity: 1;
    }
    100% {
        top: 110vh;
        opacity: 0;
    }
`;

const popIn = keyframes`
    from {
        opacity: 0;
        transform: scale(0.9);
    }
    to {
        opacity: 1;
        transform: scale(1);
    }
`;

const Container = styled.div`
    width: 100%;
    height: 100vh;
    background-color: #9ADDFF;
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    align-items: center;
`;

const TargetBox = styled(Flex)`
    position: absolute;
    width: 200px;
    height: 60px;
    background: rgba(255, 255, 255, 0.8);
    top: 40px;
    left: 50%;
    transform: translateX(-50%);
    border-radius: 100px;
    z-index: 10;
    font-size: 48px;
    font-weight: 700;
    color: #004F7F;
`;

const RestartButton = styled.button`
    position: absolute;
    top: 48px;
    right: 24px;
    background: transparent;
    border: none;
    cursor: pointer;
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;

    img {
        width: 44px;
        height: 44px;
    }
`;

const EquationDisplay = styled.div`
    position: absolute;
    top: 108px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 10;
    text-align: center;
    white-space: nowrap;
    color: #004671;
    font-size: 18px;
    font-weight: 400;
`;

const BubbleWrapper = styled.div<{ $left: number; $duration: number; $delay: number; $paused: boolean }>`
    position: absolute;
    left: ${props => props.$left}%;
    top: -100px;
    animation: ${bubbleFall} ${props => props.$duration}s linear ${props => props.$delay}s forwards;
    animation-play-state: ${props => (props.$paused ? 'paused' : 'running')};
    cursor: pointer;
    user-select: none;
    transition: transform 0.15s;

    &:hover {
        transform: scale(1.1);
    }

    &:active {
        transform: scale(0.95);
    }
`;

const BubbleImage = styled(Flex)`
    width: 90px;
    height: 90px;
    background-image: url('/assets/img/game-bubble.svg');
    background-size: contain;
    background-repeat: no-repeat;
    position: relative;
    color: #004F7F;
    font-size: 32px;
    font-weight: 700;
`;

const Overlay = styled.div`
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgba(154, 221, 255, 0.7);
    backdrop-filter: blur(6px);
    z-index: 20;
    animation: ${popIn} 0.4s ease-out;
`;

const OverlayCard = styled(Flex)`
    width: 280px;
    height: 340px;
    background: #FFFFFF;
    border-radius: 24px;
    box-shadow: 0 4px 10px rgba(0, 79, 127, 0.2);
`;

const ResultTitle = styled.p<{ $color: string }>`
    font-size: 48px;
    font-weight: 700;
    color: ${props => props.$color};
`;

const ResultDetail = styled.p`
    font-size: 20px;
    color: #004F7F;
`;

const ActionButton = styled.button<{ $variant: 'primary' | 'ghost' }>`
    width: 200px;
    height: 52px;
    border-radius: 100px;
    font-size: 20px;
    font-weight: 700;
    cursor: pointer;
    transition: transform 0.15s;
    border: 3px solid #004F7F;

    background-color: ${props => props.$variant === 'primary' ? '#004F7F' : '#FFFFFF'};
    color: ${props => props.$variant === 'primary' ? '#FFFFFF' : '#004F7F'};

    &:hover {
        transform: scale(1.05);
    }

    &:active {
        transform: scale(0.95);
    }
`;