"use client";

import { FC } from "react";
import { Activity, Clock, AlertTriangle, Sun } from "lucide-react";

import { useTrafficLevel } from "@/shared/hooks/useTrafficLevel";
import { cn } from "@/lib/utils";

const TrafficStatusPanel: FC = () => {
    const { currentLevel, isPeakTime, currentPeakLabel, nextPeakTime } =
        useTrafficLevel();

    return (
        <div className="glass floating-panel rounded-xl p-4 animate-slide-up w-full">
            {/* Traffic Level Header */}
            <div className="flex items-center gap-3 mb-4">
                <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                    style={{ backgroundColor: `${currentLevel.color}15` }}
                >
                    {currentLevel.emoji}
                </div>
                <div className="flex-1">
                    <h3
                        className="text-sm font-semibold"
                        style={{ color: currentLevel.color }}
                    >
                        {currentLevel.label}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                        {currentLevel.description}
                    </p>
                </div>
                <div
                    className={cn(
                        "w-3 h-3 rounded-full traffic-pulse",
                    )}
                    style={{ backgroundColor: currentLevel.color }}
                />
            </div>

            {/* Divider */}
            <div className="h-px bg-border mb-3" />

            {/* Peak Time Status */}
            <div className="space-y-2.5">
                {isPeakTime ? (
                    <div className="flex items-center gap-2.5 bg-red-500/10 rounded-lg px-3 py-2">
                        <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                        <div>
                            <p className="text-xs font-medium text-red-400">
                                {currentPeakLabel} Active
                            </p>
                            <p className="text-[11px] text-red-400/70">
                                Expect delays on major roads
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center gap-2.5 bg-emerald-500/10 rounded-lg px-3 py-2">
                        <Sun className="w-4 h-4 text-emerald-400 shrink-0" />
                        <div>
                            <p className="text-xs font-medium text-emerald-400">
                                Outside Peak Hours
                            </p>
                            <p className="text-[11px] text-emerald-400/70">
                                {nextPeakTime}
                            </p>
                        </div>
                    </div>
                )}

                {/* Peak Times Info */}
                <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        <div>
                            <p className="text-[11px] text-muted-foreground">Morning</p>
                            <p className="text-xs font-medium">07:30 – 09:00</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2">
                        <Clock className="w-3.5 h-3.5 text-orange-400" />
                        <div>
                            <p className="text-[11px] text-muted-foreground">Evening</p>
                            <p className="text-xs font-medium">16:30 – 18:30</p>
                        </div>
                    </div>
                </div>

                {/* Traffic Legend */}
                <div className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2">
                    <span className="text-[11px] text-muted-foreground">
                        Traffic Legend:
                    </span>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-emerald-400" />
                            <span className="text-[10px] text-muted-foreground">Low</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-amber-400" />
                            <span className="text-[10px] text-muted-foreground">Medium</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-red-400" />
                            <span className="text-[10px] text-muted-foreground">Heavy</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TrafficStatusPanel;
