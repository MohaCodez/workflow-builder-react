import CustomNode from './CustomNode';
import ActionNode from './ActionNode';
import TriggerNode from './TriggerNode';
import ConditionNode from './ConditionNode';

// Add default styles for preview
const defaultNodeStyles = {
  padding: '10px',
  borderRadius: '5px',
  border: '1px solid #ddd',
  backgroundColor: '#fff',
  minWidth: 150,
  textAlign: 'center',
};

const nodeStyles = {
  trigger: {
    ...defaultNodeStyles,
    backgroundColor: '#e3f2fd',
    borderColor: '#90caf9',
  },
  condition: {
    ...defaultNodeStyles,
    backgroundColor: '#f3e5f5',
    borderColor: '#ce93d8',
  },
  action: {
    ...defaultNodeStyles,
    backgroundColor: '#e8f5e9',
    borderColor: '#a5d6a7',
  },
};

export const nodeTypes = {
  custom: CustomNode,
  action: ActionNode,
  trigger: TriggerNode,
  condition: ConditionNode,
}; 