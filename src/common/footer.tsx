import { Instagram, WhatsApp } from '@mui/icons-material';
import {  styled } from '@mui/material';

const FooterWrapper = styled('footer')`
  font-size: 14px;
  background-color: #1f1f24;
  padding: 50px 0;
  color: rgba(255, 255, 255, 0.7);
  .icon {
    margin-right: 15px;
    font-size: 24px;
    line-height: 0;
  }
  h4 {
    font-size: 16px;
    font-weight: bold;
    position: relative;
    padding-bottom: 5px;
    color: #fff;
    margin: 0;
  }
  .footer-links {
    margin-bottom: 30px;
    ul {
      list-style: none;
      padding: 0;
      margin: 0;
      li {
        padding: 10px 0;
        display: flex;
        align-items: center;
      }
      li:first-child {
        padding-top: 0;
      }
      a {
        color: rgba(255, 255, 255, 0.6);
        transition: 0.3s;
        display: inline-block;
        line-height: 1;
      }
    }
  }
  .social-links {
    display: flex;
    a {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: 1px solid rgba(255, 255, 255, 0.2);
      font-size: 16px;
      color: rgba(255, 255, 255, 0.7);
      margin-right: 10px;
      transition: 0.3s;
    }
  }
  .copyright {
    text-align: center;
    padding-top: 30px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }
  .credits {
    padding-top: 4px;
    text-align: center;
    font-size: 13px;
    a {
      color: #fff;
    }
  }
  .container {
    width: 100%;
    padding-right: 15px;
    padding-left: 15px;
    margin-right: auto;
    margin-left: auto;
  }

  /* Row */
  .row {
    display: flex;
    flex-wrap: wrap;
    margin-right: -15px;
    margin-left: -15px;
    flex-direction: row;
    justify-content: space-between;
  }

  /* Column */
  .col-lg-3 {
    position: relative;
    width: fit-content;
    padding-right: 15px;
    padding-left: 15px;
  }
`;

export const Footer = () => {
  return (
    <FooterWrapper>
      <div className="container">
        <div className="row gy-3">
          <div className="col-lg-3 col-md-6 d-flex">
            <div>
              <h4>Company</h4>
              <div>
                <a href="/privacy-policy" style={{ color: 'beige' }}>
                  <u>Privacy Policy</u>
                </a>{' '}
                <br />
                <a href="/tc.html" style={{ color: 'beige' }}>
                  <u>Terms and Conditions</u>
                </a>{' '}
                <br />
                <a href="/refund-policy.html" style={{ color: 'beige' }}>
                  <u>Return Policy</u>
                </a>{' '}
                <br />
                <a href="/shipping-policy.html" style={{ color: 'beige' }}>
                  <u>Shipping Policy</u>
                </a>
              </div>
            </div>
          </div>

          <div className="col-lg-3 col-md-6 footer-links d-flex">
            <i className="bi bi-telephone icon"></i>
            <div>
              <h4>Call</h4>
              <p>
                <strong>Phone:</strong> 8220080109
                <br />
                <strong>Email:</strong> info@coupongpt.app
                <br />
              </p>
            </div>
          </div>
          <div className="col-lg-3 col-md-6 footer-links">
            <h4>Follow Us</h4>
            <div className="social-links d-flex">
              <a
                href="https://www.instagram.com/burn_delivery/"
                className="telegram"
              >
                <Instagram />
              </a>
              <a
                href="https://wa.me/message/JYCEPKNIELVZN1"
                className="telegram"
              >
                <WhatsApp />
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="copyright">
          &copy; Copyright{' '}
          <strong>
            <span>Goburn</span>
          </strong>
          . All Rights Reserved
        </div>
      </div>
    </FooterWrapper>
  );
};
