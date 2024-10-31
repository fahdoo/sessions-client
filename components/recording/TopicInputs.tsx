import { TopicInput } from './TopicInput';
import React from 'react';

interface TopicInputsProps {
  inputs: string[];
  onInputChange: (index: number, value: string) => void;
  maxTopics: number;
  sparkleClicked: number | null;
  onSparkleClick: (index: number) => void;
  defaultPlaceholder: string;
}

export function TopicInputs({
  inputs,
  onInputChange,
  maxTopics,
  sparkleClicked,
  onSparkleClick,
  defaultPlaceholder
}: TopicInputsProps) {
  return (
    <div className="flex flex-col gap-2">
      {inputs.map((input, index) => (
        <TopicInput
          key={index}
          index={index}
          input={input}
          onInputChange={onInputChange}
          onSparkleClick={onSparkleClick}
          sparkleClicked={sparkleClicked}
          placeholder={index === 0 ? defaultPlaceholder : "Add another topic..."}
          maxTopics={maxTopics}
          totalInputs={inputs.length}
        />
      ))}
    </div>
  );
} 