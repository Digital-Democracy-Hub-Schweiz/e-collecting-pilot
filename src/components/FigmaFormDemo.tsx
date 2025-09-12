import React from "react";

export default function FigmaFormDemo() {
	return (
		<div className="bg-[#f1f4f7] box-border content-stretch flex flex-col items-start justify-start px-[597px] py-20 w-full">
			<div className="w-[805px]">
				<h3 className="text-[32px] leading-[43px] font-semibold text-black">Form example</h3>
			</div>
			<div className="h-6 opacity-0" />
			<div className="w-full max-w-[805px] space-y-6">
				{/* Input 1 */}
				<div className="w-full">
					<div className="text-[18px] leading-[28px] font-medium text-[#1f2937]">Input type text</div>
					<div className="h-2 opacity-0" />
					<div className="bg-white h-12 relative rounded-[1px]">
						<div className="flex items-center h-12 pb-[11px] pt-2.5 px-5">
							<div className="text-[18px] text-[#6b7280] leading-[28px]">Placeholder</div>
						</div>
						<div aria-hidden className="absolute inset-0 border border-[#6b7280] rounded-[1px] shadow-[0px_1px_2px_0px_rgba(17,24,39,0.08)]" />
					</div>
				</div>

				{/* Input 2 filled */}
				<div className="w-full">
					<div className="text-[18px] leading-[28px] font-medium text-[#1f2937]">Input type text</div>
					<div className="h-2 opacity-0" />
					<div className="bg-white h-12 relative rounded-[1px]">
						<div className="flex items-center h-12 pb-[11px] pt-2.5 px-5">
							<div className="text-[18px] text-[#1f2937] leading-[28px]">Text is filled</div>
						</div>
						<div aria-hidden className="absolute inset-0 border border-[#6b7280] rounded-[1px] shadow-[0px_1px_2px_0px_rgba(17,24,39,0.08)]" />
					</div>
				</div>

				{/* Input 3 error */}
				<div className="w-full">
					<div className="text-[18px] leading-[28px] font-medium text-[#1f2937]">Input type text</div>
					<div className="h-2 opacity-0" />
					<div className="bg-white h-12 relative rounded-[1px]">
						<div className="flex items-center h-12 pb-[11px] pt-2.5 px-5">
							<div className="text-[18px] text-[#d8232a] leading-[28px]">Placeholder</div>
						</div>
						<div aria-hidden className="absolute inset-0 border border-[#d8232a] rounded-[1px] shadow-[0px_1px_2px_0px_rgba(17,24,39,0.08)]" />
					</div>
					<div className="h-2 opacity-0" />
					<div className="bg-[#ffedee] text-[#d8232a] text-[12px] leading-[15px] rounded-[10px] px-2.5 py-0.5 inline-block">Error description here</div>
				</div>

				{/* Select */}
				<div className="w-full">
					<div className="text-[18px] leading-[28px] font-medium text-[#1f2937]">Select</div>
					<div className="h-2 opacity-0" />
					<div className="relative rounded-[1px] w-full">
						<div className="flex flex-col gap-2 w-full">
							<div className="bg-white flex items-center h-12 pl-5 pr-0 rounded-[1px] w-full relative">
								<div aria-hidden className="absolute inset-0 border border-[#6b7280] rounded-[1px] shadow-[0px_1px_2px_0px_rgba(17,24,39,0.08)]" />
								<div className="text-[18px] text-[#1f2937] leading-[28px]">Choose you country</div>
								<div className="shrink-0 w-12 h-12 relative">
									<div aria-hidden className="absolute inset-0 border border-[#6b7280]" />
								</div>
							</div>
						</div>
						<div aria-hidden className="absolute inset-0 border border-[#9ca3af] rounded-[1px] shadow-[0px_1px_2px_0px_rgba(17,24,39,0.08)]" />
					</div>
				</div>

				{/* Radios */}
				<div className="w-full space-y-2">
					<div className="text-[18px] leading-[28px] font-medium text-[#1f2937]">Radio buttons</div>
					<div className="flex items-center gap-[9px] h-12">
						<div className="bg-white rounded-full w-4 h-4 relative">
							<div aria-hidden className="absolute inset-0 border border-[#6b7280] rounded-full shadow-[0px_1px_2px_0px_rgba(17,24,39,0.08)]" />
						</div>
						<div className="text-[18px] leading-[28px] text-[#1f2937]">Radio one</div>
					</div>
					<div className="flex items-center gap-[9px] h-12">
						<div className="bg-white rounded-full w-4 h-4 relative">
							<div aria-hidden className="absolute inset-0 border border-[#6b7280] rounded-full shadow-[0px_1px_2px_0px_rgba(17,24,39,0.08)]" />
						</div>
						<div className="text-[18px] leading-[28px] text-[#1f2937]">Radio two</div>
					</div>
					<div className="flex items-center gap-[9px] h-12">
						<div className="bg-white rounded-full w-4 h-4 relative">
							<div aria-hidden className="absolute inset-0 border border-[#6b7280] rounded-full shadow-[0px_1px_2px_0px_rgba(17,24,39,0.08)]" />
						</div>
						<div className="text-[18px] leading-[28px] text-[#1f2937]">Radio three</div>
					</div>
				</div>

				{/* Checkboxes */}
				<div className="w-full space-y-2">
					<div className="text-[18px] leading-[28px] font-medium text-[#1f2937]">Checkboxes</div>
					<div className="flex items-center gap-[9px] h-12">
						<div className="bg-white rounded-[1px] w-4 h-4 relative">
							<div aria-hidden className="absolute inset-0 border border-[#6b7280] rounded-[1px] shadow-[0px_1px_2px_0px_rgba(17,24,39,0.08)]" />
						</div>
						<div className="text-[18px] leading-[28px] text-[#1f2937]">Checkbox one</div>
					</div>
					<div className="flex items-center gap-[9px] h-12">
						<div className="bg-white rounded-[1px] w-4 h-4 relative">
							<div aria-hidden className="absolute inset-0 border border-[#6b7280] rounded-[1px] shadow-[0px_1px_2px_0px_rgba(17,24,39,0.08)]" />
						</div>
						<div className="text-[18px] leading-[28px] text-[#1f2937]">Checkbox two</div>
					</div>
				</div>

				{/* Textarea */}
				<div className="w-full">
					<div className="text-[18px] leading-[28px] font-medium text-[#1f2937]">Input type textarea</div>
					<div className="h-2 opacity-0" />
					<div className="bg-white relative rounded-[1px]">
						<div className="min-h-[174px]">
							<div className="text-[18px] leading-[28px] text-[#1f2937] pt-[11px] pl-5 pr-[19px]">Textarea text</div>
							<div className="absolute bottom-[3px] right-[3px] w-3 h-3" />
						</div>
						<div aria-hidden className="absolute inset-0 border border-[#6b7280] rounded-[1px] shadow-[0px_1px_2px_0px_rgba(17,24,39,0.08)]" />
					</div>
				</div>

				<div className="h-6 opacity-0" />
				<div className="w-full flex justify-end">
					<button className="px-5 py-2.5 bg-[#5c6977] text-white rounded-[1px] text-[20px] leading-[32px] shadow-[0px_2px_4px_-1px_rgba(17,24,39,0.08)] hover:bg-[#4c5967]">Send form</button>
				</div>
			</div>
		</div>
	);
}
