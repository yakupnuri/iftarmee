"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface AdminTabsProps {
    groupManagementContent: React.ReactNode;
    groupPerformanceContent: React.ReactNode;
    allInvitationsContent: React.ReactNode;
}

export function AdminTabs({ groupManagementContent, groupPerformanceContent, allInvitationsContent }: AdminTabsProps) {
    const [activeTab, setActiveTab] = useState<"groups" | "performance" | "invitations">("groups");

    return (
        <div>
            {/* Tabs */}
            <div className="bg-white rounded-t-2xl border-x border-t border-slate-200 overflow-hidden">
                <div className="flex border-b border-slate-200">
                    <button
                        onClick={() => setActiveTab("groups")}
                        className={cn(
                            "flex-1 px-6 py-4 text-sm font-bold transition-colors relative",
                            activeTab === "groups"
                                ? "bg-primary-50 text-primary-900 border-b-2 border-primary-500"
                                : "text-slate-600 hover:bg-slate-50"
                        )}
                    >
                        Misafir Grupları
                    </button>
                    <button
                        onClick={() => setActiveTab("performance")}
                        className={cn(
                            "flex-1 px-6 py-4 text-sm font-bold transition-colors relative",
                            activeTab === "performance"
                                ? "bg-primary-50 text-primary-900 border-b-2 border-primary-500"
                                : "text-slate-600 hover:bg-slate-50"
                        )}
                    >
                        Grup Performansları
                    </button>
                    <button
                        onClick={() => setActiveTab("invitations")}
                        className={cn(
                            "flex-1 px-6 py-4 text-sm font-bold transition-colors relative",
                            activeTab === "invitations"
                                ? "bg-primary-50 text-primary-900 border-b-2 border-primary-500"
                                : "text-slate-600 hover:bg-slate-50"
                        )}
                    >
                        Tüm Davetler
                    </button>
                </div>
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-b-2xl border-x border-b border-slate-200 p-6">
                {activeTab === "groups" && groupManagementContent}
                {activeTab === "performance" && groupPerformanceContent}
                {activeTab === "invitations" && allInvitationsContent}
            </div>
        </div>
    );
}
