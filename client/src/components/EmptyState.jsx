import React from 'react';
import Button from './Button';
import Icon from './Icon';

const EmptyState = ({
  icon = 'folder',
  title = 'No Data Available',
  description = 'You have not created or uploaded any items yet.',
  actionLabel,
  onAction,
  actionIcon = 'filePlus',
  className = ''
}) => {
  return (
    <div className={`bg-slate-900/50 border border-dashed border-slate-800 rounded-2xl p-10 text-center flex flex-col items-center justify-center space-y-4 ${className}`}>
      <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shadow-lg shadow-indigo-500/10">
        <Icon name={icon} className="w-7 h-7" />
      </div>

      <div className="max-w-sm space-y-1">
        <h4 className="text-base font-semibold text-slate-200">{title}</h4>
        <p className="text-xs text-slate-400 leading-relaxed">{description}</p>
      </div>

      {actionLabel && onAction && (
        <Button
          variant="primary"
          size="sm"
          onClick={onAction}
          icon={<Icon name={actionIcon} className="w-4 h-4" />}
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
