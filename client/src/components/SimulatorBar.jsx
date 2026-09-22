import React from 'react';

export default function SimulatorBar({ onRunEvaluation, onRefresh }) {
  return (
    <div className="simulator-banner">
      <span>⚡ <strong>System Simulator:</strong> Test real-time background SLA rules & payment webhooks</span>
      <div className="simulator-actions">
        <button className="btn btn-secondary btn-sm" onClick={onRunEvaluation}>
          🔄 Run Overdue SLA Evaluation
        </button>
        <button className="btn btn-secondary btn-sm" onClick={onRefresh}>
          🔁 Refresh
        </button>
      </div>
    </div>
  );
}
