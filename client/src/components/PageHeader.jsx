import React from 'react';

const PageHeader = ({
  title,
  subtitle,
  badge,
  action,
  breadcrumbs = [],
  className = ''
}) => {
  return (
    <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800/80 mb-8 ${className}`}>
      <div className="space-y-1">
        {breadcrumbs.length > 0 && (
          <nav className="flex items-center space-x-2 text-xs text-slate-400 mb-2">
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <span>/</span>}
                <span className={idx === breadcrumbs.length - 1 ? 'text-indigo-400 font-medium' : 'hover:text-slate-200'}>
                  {crumb}
                </span>
              </React.Fragment>
            ))}
          </nav>
        )}

        <div className="flex items-center space-x-3">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {title}
          </h1>
          {badge && (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              {badge}
            </span>
          )}
        </div>

        {subtitle && (
          <p className="text-sm text-slate-400 max-w-2xl">
            {subtitle}
          </p>
        )}
      </div>

      {action && (
        <div className="flex items-center space-x-3 shrink-0">
          {action}
        </div>
      )}
    </div>
  );
};

export default PageHeader;
