import { useCallback, useEffect, useMemo, useState } from 'react';
import { RotateCcw, Target } from 'lucide-react';
import TypingParagraph from "@/components/TypingParagraph";
const GRID_SIZE = 5;
const TOTAL_ROUNDS = 5;
const ROUND_TIME = 2500;

type Point = {
  x: number;
  y: number;
};

function randomPoint(): Point {
  return {
    x: Math.floor(Math.random() * GRID_SIZE),
    y: Math.floor(Math.random() * GRID_SIZE),
  };
}

function createSignal(previous?: Point): Point {
  let next = randomPoint();

  // Avoid putting the signal in exactly the same place twice.
  while (previous && next.x === previous.x && next.y === previous.y) {
    next = randomPoint();
  }

  return next;
}

export function SignalGame() {
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [roundStartedAt, setRoundStartedAt] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [signal, setSignal] = useState<Point>(() => createSignal());
  const [misses, setMisses] = useState(0);

  const progress = useMemo(
    () => Math.min(100, ((round - 1) / TOTAL_ROUNDS) * 100),
    [round],
  );

  const startGame = useCallback(() => {
    const now = performance.now();

    setStarted(true);
    setFinished(false);
    setRound(1);
    setScore(0);
    setMisses(0);
    setElapsed(0);
    setRoundStartedAt(now);
    setSignal(createSignal());
  }, []);

  const finishGame = useCallback(() => {
    setFinished(true);
    setStarted(false);
  }, []);

  const handleCellClick = (x: number, y: number) => {
    if (!started || finished) return;

    if (x !== signal.x || y !== signal.y) {
      setMisses(value => value + 1);
      return;
    }

    const reactionTime = performance.now() - roundStartedAt;

    // Faster = more points.
    const roundScore = Math.max(
      100,
      Math.round(1000 - reactionTime * 0.65),
    );

    setScore(value => value + roundScore);

    if (round >= TOTAL_ROUNDS) {
      finishGame();
      return;
    }

    const nextRound = round + 1;
    const nextSignal = createSignal(signal);

    setRound(nextRound);
    setSignal(nextSignal);
    setRoundStartedAt(performance.now());
    setElapsed(0);
  };

  useEffect(() => {
    if (!started || finished) return;

    let frame = 0;

    const updateTimer = () => {
      const current = performance.now() - roundStartedAt;
      setElapsed(current);

      if (current >= ROUND_TIME) {
        if (round >= TOTAL_ROUNDS) {
          finishGame();
        } else {
          const nextRound = round + 1;

          setRound(nextRound);
          setSignal(createSignal(signal));
          setRoundStartedAt(performance.now());
          setElapsed(0);
        }

        return;
      }

      frame = requestAnimationFrame(updateTimer);
    };

    frame = requestAnimationFrame(updateTimer);

    return () => cancelAnimationFrame(frame);
  }, [
    started,
    finished,
    round,
    roundStartedAt,
    signal,
    finishGame,
  ]);

  const remaining = Math.max(0, ROUND_TIME - elapsed);
  const timerWidth = (remaining / ROUND_TIME) * 100;

  return (
    <section className="border-y border-border bg-card">
      <div className="mx-auto max-w-[1440px] px-5 py-20 md:px-10 md:py-28">

        {/* Header */}
        <div className="grid gap-8 md:grid-cols-[.7fr_1.3fr] md:items-end">
          <div>
            <p className="eyebrow text-primary">
              A small test of attention
            </p>

            <div className="mt-5 flex items-center gap-3">
              <Target size={17} className="text-primary" />

              <span className="mono text-[10px] text-muted-foreground">
                SH / SIGNAL-01
              </span>
            </div>
          </div>

          <div>
            <h2 className="display max-w-3xl text-5xl leading-[.95] tracking-[-.04em] md:text-7xl">
              Find the signal.
            </h2>

            <TypingParagraph
  text="Attention is a competitive advantage. Find the gold signal before the clock runs out."
  className="mt-5 max-w-xl text-sm leading-7 text-muted-foreground md:text-base"
/>
          </div>
        </div>

        {/* Game */}
        <div className="mt-14 border border-border bg-background">

          {/* Stats bar */}
          <div className="grid grid-cols-3 border-b border-border">
            <div className="border-r border-border p-4 md:p-5">
              <p className="eyebrow text-muted-foreground">
                Round
              </p>

              <p className="mono mt-2 text-xs text-primary">
                {String(Math.min(round, TOTAL_ROUNDS)).padStart(2, '0')}
                {' / '}
                {String(TOTAL_ROUNDS).padStart(2, '0')}
              </p>
            </div>

            <div className="border-r border-border p-4 md:p-5">
              <p className="eyebrow text-muted-foreground">
                Score
              </p>

              <p className="mono mt-2 text-xs text-primary">
                {String(score).padStart(4, '0')}
              </p>
            </div>

            <div className="p-4 md:p-5">
              <p className="eyebrow text-muted-foreground">
                Misses
              </p>

              <p className="mono mt-2 text-xs text-primary">
                {String(misses).padStart(2, '0')}
              </p>
            </div>
          </div>

          {/* Timer */}
          <div className="h-px bg-border">
            <div
              className="h-full bg-primary transition-[width] duration-75"
              style={{
                width: `${started ? timerWidth : 0}%`,
              }}
            />
          </div>

          <div className="p-5 md:p-10">

            {/* Start Screen */}
            {!started && !finished && (
              <div className="grid min-h-[360px] place-items-center">
                <div className="max-w-md text-center">

                  <div className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-primary/50">
                    <Target className="text-primary" size={22} />
                  </div>

                  <p className="eyebrow mt-7 text-primary">
                    Ready?
                  </p>

                  <h3 className="display mt-3 text-4xl md:text-5xl">
                    Find five signals.
                  </h3>

                  <p className="mt-5 text-sm leading-7 text-muted-foreground">
                    One cell is different. Spot it as quickly as
                    you can. Speed matters.
                  </p>

                  <button
                    type="button"
                    onClick={startGame}
                    className="mt-8 inline-flex items-center gap-3 border border-primary bg-primary px-5 py-3 text-xs font-bold uppercase tracking-[.14em] text-primary-foreground transition-colors hover:bg-transparent hover:text-primary"
                  >
                    Start the test
                  </button>
                </div>
              </div>
            )}

            {/* Game Grid */}
            {started && (
              <div className="mx-auto w-full max-w-xl">

                <div
                  className="
                    mx-auto
                    grid
                    aspect-square
                    w-full
                    max-w-[460px]
                    gap-1.5
                    sm:gap-2
                    md:max-w-[min(460px,calc(100dvh-420px))]
                  "
                  style={{
                    gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
                  }}
                >
                  {Array.from({
                    length: GRID_SIZE * GRID_SIZE,
                  }).map((_, index) => {
                    const x = index % GRID_SIZE;
                    const y = Math.floor(index / GRID_SIZE);

                    const isSignal =
                      x === signal.x && y === signal.y;

                    return (
                      <button
                        key={`${x}-${y}`}
                        type="button"
                        onClick={() => handleCellClick(x, y)}
                        aria-label={
                          isSignal
                            ? 'Signal'
                            : `Cell ${index + 1}`
                        }
                        className={[
                          'group relative border border-border',
                          'bg-card transition-all duration-150',
                          'hover:border-primary/40 hover:bg-secondary',
                          'active:scale-[.96]',
                        ].join(' ')}
                      >
                        <span
                          className={[
                            'absolute inset-[28%] rounded-full',
                            'transition-all duration-200',
                            isSignal
                              ? 'scale-100 bg-primary shadow-[0_0_25px_hsl(var(--primary)/.45)]'
                              : 'scale-75 bg-border/30 group-hover:bg-primary/20',
                          ].join(' ')}
                        />

                        {isSignal && (
                          <span className="absolute inset-[38%] rounded-full bg-primary-foreground/80" />
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <span className="mono text-[10px] text-muted-foreground">
                    SIGNAL DETECTION
                  </span>

                  <span className="mono text-[10px] text-primary">
                    {(remaining / 1000).toFixed(2)}s
                  </span>
                </div>
              </div>
            )}

            {/* Finished Screen */}
            {finished && (
              <div className="grid min-h-[360px] place-items-center">
                <div className="text-center">

                  <p className="eyebrow text-primary">
                    Signal acquired
                  </p>

                  <h3 className="display mt-4 text-6xl leading-none md:text-8xl">
                    {score}
                  </h3>

                  <p className="mt-4 text-sm text-muted-foreground">
                    Final score
                  </p>

                  <div className="mt-8 flex flex-wrap justify-center gap-6 mono text-[10px] text-muted-foreground">
                    <span>
                      ROUNDS / {TOTAL_ROUNDS}
                    </span>

                    <span>
                      MISSES / {String(misses).padStart(2, '0')}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={startGame}
                    className="mt-9 inline-flex items-center gap-3 border border-primary px-5 py-3 text-xs font-bold uppercase tracking-[.14em] text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
                  >
                    <RotateCcw size={14} />
                    Run it again
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer line */}
        <div className="mt-6 flex justify-between mono text-[9px] tracking-[.12em] text-muted-foreground">
          <span>
            ATTENTION / SPEED / SIGNAL
          </span>

          <span className="hidden sm:block">
            WHERE STRATEGY MEETS GROWTH
          </span>
        </div>
      </div>
    </section>
  );
}
