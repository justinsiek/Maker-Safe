import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { AlertTriangle } from "lucide-react"

export default function Violations({ violations = [] }) {

  return (
    <div className="flex flex-col h-[45%] rounded-lg overflow-hidden my-4 px-6 py-4 bg-surface relative">
      <div className="flex flex-col mb-3">
        <div className="flex gap-2 mb-2">
          <AlertTriangle className="w-6 h-6 text-[#A100FF]" />
          <h1 className="text-xl font-semibold">Violations</h1>
        </div>
        {/* Accent underline */}
        <div className="w-34 h-1 bg-[#A100FF] rounded-full"></div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide px-8 pb-8">
        <Accordion type="single" collapsible className="space-y-4">
          {violations.map((violation) => (
            <AccordionItem 
              key={violation.id} 
              value={violation.id}
              className="border-2 border-neutral-200 rounded-lg overflow-hidden data-[state=open]:border-[#A100FF]"
            >
              
              <AccordionTrigger className="px-4 py-4 hover:no-underline hover:bg-neutral-50 data-[state=open]:bg-purple-50">
                <div className="flex items-center gap-3 w-full justify-around">
                  {/* Name and Violation Row */}
                  <div className="flex items-center justify-between w-full pr-4">
                    <div className="flex flex-col items-start gap-2">
                      <span className="text-sm font-medium text-neutral-900">
                        {violation.name}
                      </span>
                      <span className={`${violation.severityColor} text-white px-3 py-1 rounded text-xs font-medium`}>
                        {violation.violation}
                      </span>
                    </div>
                  </div>
                  
                  {/* Time and Date Column */}
                  <div className="w-full flex flex-col justify-center items-center gap-1">
                    <span className="text-xs text-neutral-500 font-normal">
                      {violation.time}
                    </span>
                    <span className="text-xs text-neutral-400 font-normal">
                      {new Date(violation.createdAt).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </span>
                  </div>
                </div>
              </AccordionTrigger>
              
              
              <AccordionContent className="px-4 py-4 bg-white border-t">
                {/* Row layout with image on left, details on right */}
                <div className="flex gap-4">
                  {/* Image container - takes 40% width */}
                  <div className="w-2/5 h-48 bg-neutral-100 rounded-lg overflow-hidden shrink-0">
                    {violation.image ? (
                      <img 
                        src={violation.image} 
                        alt={`${violation.name} violation`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-neutral-400 text-sm">
                        No image available
                      </div>
                    )}
                  </div>
                  
                  {/* Details container - takes 60% width */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-neutral-500 font-normal">Location:</span>
                        <span className="text-sm font-medium text-neutral-900">{violation.location}</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-neutral-500 font-normal">Time:</span>
                        <span className="text-sm font-medium text-neutral-900">{violation.time}</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-neutral-500 font-normal">Severity:</span>
                        <span className={`${violation.severityColor} text-white px-3 py-1 rounded text-xs font-medium`}>
                          {violation.severity}
                        </span>
                      </div>
                      
                      <div className="pt-2 border-t">
                        <span className="text-sm text-neutral-500 font-normal block mb-2">Description:</span>
                        <p className="text-sm text-neutral-900 font-normal leading-relaxed">{violation.description}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
      
      {/* Fade overlay at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
    </div>
  );
}