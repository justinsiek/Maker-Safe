import { useState } from "react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Card } from "@/components/ui/card"
import { ChevronDown } from "lucide-react"

export default function Violations({ violations = [] }) {
  
  return (
    <div className="p-8 bg-white h-full mx-4">
      <h1 className="text-3xl font-light mb-4">Violations</h1>
      
      <Accordion type="single" collapsible className="space-y-4">
        {violations.map((violation) => (
          <AccordionItem 
            key={violation.id} 
            value={violation.id}
            className="border-2 border-neutral-200 rounded-lg overflow-hidden data-[state=open]:border-blue-500"
          >
            <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-neutral-50 data-[state=open]:bg-blue-50">
              <div className="flex items-center justify-between w-full pr-4">
                <div className="flex flex-col items-start gap-2">
                  <span className="text-xl font-light text-neutral-900">
                    {violation.name}
                  </span>
                  <span className={`${violation.severityColor} text-white px-3 py-1 rounded text-sm font-medium`}>
                    {violation.violation}
                  </span>
                </div>
              </div>
            </AccordionTrigger>
            
            <AccordionContent className="px-6 py-4 bg-white border-t">
              {/* Fixed height image container */}
              <div className="w-full h-64 mb-4 bg-neutral-100 rounded-lg overflow-hidden">
                {violation.image ? (
                  <img 
                    src={violation.image} 
                    alt={`${violation.name} violation`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-neutral-400">
                    No image available
                  </div>
                )}
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-neutral-600">Location:</span>
                  <span className="font-semibold text-neutral-900">{violation.location}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-neutral-600">Time:</span>
                  <span className="font-semibold text-neutral-900">{violation.time}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-neutral-600">Severity:</span>
                  <span className={`${violation.severityColor} text-white px-3 py-1 rounded text-sm font-medium`}>
                    {violation.severity}
                  </span>
                </div>
                
                <div className="pt-2 border-t">
                  <span className="text-neutral-600 block mb-2">Description:</span>
                  <p className="text-neutral-900 min-h-12">{violation.description}</p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}