import { Minimize2 } from "lucide-react";
import { Button } from "../ui/button";
import { Trigger } from "@radix-ui/react-collapsible";
import { UploadWidgetTitle } from "./title";

export function UploadWidgetHeader(){
    return (
        <div className="w-full p-4 py-2 bg-white/2 border-zinc-800 border-b flex items-center justify-between">
            <UploadWidgetTitle />

            <Trigger asChild>
                <Button size="icon" className="-mr-2">
                    <Minimize2 strokeWidth={1.5} className="size-4"/>
                </Button>
            </Trigger>
        </div>
    )
}