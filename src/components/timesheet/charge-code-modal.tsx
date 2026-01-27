"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChargeCodes } from "@/hooks/use-charge-codes";
import { ChargeCodeOption } from "@/types";
import { Plus, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChargeCodeModalProps {
    selectedCodes: string[]; // IDs of already selected codes
    onSelect: (chargeCode: ChargeCodeOption) => void;
}

export function ChargeCodeModal({
    selectedCodes,
    onSelect,
}: ChargeCodeModalProps) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const { data: chargeCodes, isLoading } = useChargeCodes();

    const filteredCodes = chargeCodes?.filter(
        (code) =>
            !selectedCodes.includes(code.id) &&
            (code.code.toLowerCase().includes(search.toLowerCase()) ||
                code.description.toLowerCase().includes(search.toLowerCase()))
    );

    const handleSelect = (chargeCode: ChargeCodeOption) => {
        onSelect(chargeCode);
        setOpen(false);
        setSearch("");
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    className="w-full border-dashed border-slate-600 bg-slate-800/30 hover:bg-slate-700/50 text-slate-400 hover:text-slate-200"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Charge Code
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-800 border-slate-700 max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-white">Select Charge Code</DialogTitle>
                    <DialogDescription className="text-slate-400">
                        Choose a charge code to add to your timesheet
                    </DialogDescription>
                </DialogHeader>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <Input
                        placeholder="Search codes..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                    />
                </div>

                <ScrollArea className="h-[300px] pr-4">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
                        </div>
                    ) : filteredCodes?.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-slate-500">
                            <p>No charge codes available</p>
                            {search && (
                                <p className="text-sm mt-1">Try adjusting your search</p>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {filteredCodes?.map((code) => (
                                <button
                                    key={code.id}
                                    onClick={() => handleSelect(code)}
                                    className={cn(
                                        "w-full p-3 rounded-lg text-left transition-all",
                                        "bg-slate-700/30 hover:bg-slate-700/60 border border-slate-600/50",
                                        "focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                    )}
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <p className="font-medium text-white">{code.code}</p>
                                            <p className="text-sm text-slate-400 mt-0.5">
                                                {code.description}
                                            </p>
                                        </div>
                                        <Plus className="h-5 w-5 text-slate-500 shrink-0" />
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}
