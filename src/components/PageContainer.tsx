import React from "react";

type PageContainerProps = {
	children: React.ReactNode;
	className?: string;
	paddingXClassName?: string; // erlaubt px-Override
	paddingYClassName?: string; // erlaubt py-Override
};

export default function PageContainer({ children, className = "", paddingXClassName = "px-40", paddingYClassName = "" }: PageContainerProps) {
	return (
		<div className={`max-w-[2000px] mx-auto ${paddingXClassName} ${paddingYClassName} ${className}`.trim()}>
			{children}
		</div>
	);
}
