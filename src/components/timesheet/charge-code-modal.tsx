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
                    className="w-full border-dashed border-gray-300 bg-white hover:bg-gray-50 text-gray-500 hover:text-gray-700"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Charge Code
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-white border-gray-200 max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-gray-900">Select Charge Code</DialogTitle>
                    <DialogDescription className="text-gray-500">
                        Choose a charge code to add to your timesheet
                    </DialogDescription>
                </DialogHeader>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search codes..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                </div>

                <ScrollArea className="h-[300px] pr-4">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                        </div>
                    ) : filteredCodes?.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
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
                                        "bg-gray-50 hover:bg-gray-100 border border-gray-200",
                                        "focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    )}
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <p className="font-medium text-gray-900">{code.code}</p>
                                            <p className="text-sm text-gray-500 mt-0.5">
                                                {code.description}
                                            </p>
                                        </div>
                                        <Plus className="h-5 w-5 text-gray-400 shrink-0" />
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
