import React from 'react';
import './footer.css';
const Footer = () => {

    return(
      <footer className="footer mt-auto">
        <div className="footer-content d-flex flex-column flex-md-row align-items-center justify-content-between gap-2">
          <span className="text-muted-soft small">© 2026 Arigen Technology. All rights reserved.</span>
          <span className="small text-muted-soft">Built with Bootstrap 5</span>
        </div>
      </footer>
    );
}
export default Footer;