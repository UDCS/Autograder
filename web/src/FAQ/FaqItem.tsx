import { useId } from "react";

/* One question/answer row. Open state is owned by the page rather than this
   component so the "Expand all" control can drive every row at once.

   A real <button> rather than a clicked <div> (the pattern the five existing
   collapsibles in this repo use) so Enter/Space and screen readers work
   without extra handlers. */
interface FaqItemProps {
    q: string;
    children: React.ReactNode;
    open: boolean;
    onToggle: () => void;
}

function FaqItem({ q, children, open, onToggle }: FaqItemProps) {
    const answerId = useId();

    return (
        <div className="faq__item">
            <button
                type="button"
                className="faq__q"
                aria-expanded={open}
                aria-controls={answerId}
                onClick={onToggle}
            >
                <span className="faq__q-text">{q}</span>
                <span className="faq__q-arrow" aria-hidden="true">{open ? "▲" : "▼"}</span>
            </button>
            {open && <div id={answerId} className="faq__a">{children}</div>}
        </div>
    );
}

export default FaqItem;
