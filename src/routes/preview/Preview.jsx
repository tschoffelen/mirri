import React from "react";
import { Copy } from "react-feather";
import { toast, Toaster } from "react-hot-toast";
import copy from "copy-to-clipboard";
import { Link } from "@reach/router";

import "./style.scss";

const PreviewPage = ({ id }) => {
  const publicUrl = `https://mirri.link/${id}`;
  return (
    <div>
      <Toaster />

      <div className="preview">
        <div className="preview-area">
          <img src={publicUrl} />
        </div>

        <div className="box-result">
          <span className="box-url">{publicUrl}</span>
          <Copy
            className="box-copy"
            data-testid="copy-button"
            size={18}
            onClick={() => {
              if (copy(publicUrl)) {
                toast("Copied", {
                  icon: "👏",
                  style: {
                    paddingLeft: 18,
                    borderRadius: "24px",
                    background: "#333",
                    fontSize: 14,
                    color: "#fff",
                  },
                });
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default PreviewPage;
