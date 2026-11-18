import { Component } from "react";
import { Link } from "react-router-dom";
import { messages } from "../constants/messages.js";
import DocumentTitle from "./DocumentTitle.jsx";
import RetryButton from "./RetryButton.jsx";

/** Keeps a failed route inside the shared page shell. */
export default class PageErrorBoundary extends Component {
  state = { failed: false };

  /** Switches to the page fallback after a rendering error. */
  static getDerivedStateFromError() {
    return { failed: true };
  }

  /** Shows the route or its recovery actions. */
  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <section role="alert" className="space-y-4">
        <DocumentTitle>{`Holidaze | ${messages.pageLoadFailed}`}</DocumentTitle>
        <h1 className="text-h3 font-bold sm:text-h2">
          {messages.pageLoadFailed}
        </h1>
        <p className="text-muted">{messages.pageLoadFailedDescription}</p>
        <div className="flex flex-wrap gap-3">
          <RetryButton onRetry={() => this.setState({ failed: false })} />
          <Link to="/venues" className="navigation-link">
            Explore venues
          </Link>
        </div>
      </section>
    );
  }
}
