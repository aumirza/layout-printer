import { RefObject } from "react";
import { PageSizeSelector } from "./PageSizeSelector";
import { LayoutSelector } from "./LayoutSelector";
import { ImageUploader } from "./ImageUploader";
import { ExportPanel } from "./ExportPanel";
import { useCollage } from "@/context/CollageContext";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";

interface CollageSidebarProps {
  collageRef: RefObject<HTMLDivElement>;
}

export function CollageSidebar({ collageRef }: CollageSidebarProps) {
  return (
    <div className="w-full lg:w-1/4 p-4 overflow-y-auto border-r">
      <div className="space-y-6 pb-6">
        <Accordion type="single" collapsible defaultValue="page-size">
          <AccordionItem value="page-size">
            <AccordionTrigger className="text-lg font-semibold">
              Page Size
            </AccordionTrigger>
            <AccordionContent>
              <PageSizeSelector />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="photo-size">
            <AccordionTrigger className="text-lg font-semibold">
              Photo Size
            </AccordionTrigger>
            <AccordionContent>
              <LayoutSelector />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="photos">
            <AccordionTrigger className="text-lg font-semibold">
              Photos
            </AccordionTrigger>
            <AccordionContent>
              <ImageUploader />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="export">
            <AccordionTrigger className="text-lg font-semibold">
              Options & Export
            </AccordionTrigger>
            <AccordionContent>
              <ExportPanel collageRef={collageRef} />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}
