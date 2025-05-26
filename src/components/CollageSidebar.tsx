import { RefObject } from "react";
import { PageSizeSelector } from "./PageSizeSelector";
import { LayoutSelector } from "./LayoutSelector";
import { ImageUploader } from "./ImageUploader";
import { ExportPanel } from "./ExportPanel";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { UnitSelector } from "./UnitSelector";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
} from "./ui/sidebar";
import { Link } from "react-router-dom";

interface CollageSidebarProps {
  collageRef: RefObject<HTMLDivElement>;
}

export function CollageSidebar({ collageRef }: CollageSidebarProps) {
  return (
    <Sidebar>
      <SidebarHeader>
        <Link
          to="/"
          className="font-semibold text-lg hover:text-primary transition-colors"
        >
          LayoutCrafter
        </Link>
        <UnitSelector />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
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
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
