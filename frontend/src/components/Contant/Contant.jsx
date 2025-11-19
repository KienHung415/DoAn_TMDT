import React from 'react'

const Contant = () => {
  return (
    <div className="page_contact">
      <div className="container">
        <div className="row">
          {/* Cột thông tin liên hệ */}
          <div className="select_maps col-md-4 col-sm-12 col-xs-12">
            <div className="aa mid_fot_h contact_r">
              <ul className="contact padding-0">
                <li className="li_footer_h">
                  <span className="txt_content_child">
                    <i className="fas fa-map-marker-alt"></i>
                    <span className="add">
                      Toà nhà Ladeco, 266 Đội Cấn, phường Liễu Giai, Quận Ba Đình, Hà Nội
                    </span>
                  </span>
                </li>
                <li className="li_footer_h">
                  <i className="fas fa-mobile-alt"></i>
                  <a href="tel:19006750">19006750</a>
                </li>
                <li className="li_footer_h">
                  <i className="far fa-envelope"></i>
                  <a href="mailto:coolteam@gmail.com">coolteam@gmail.com</a>
                </li>
              </ul>
            </div>

            {/* Form liên hệ */}
            <div className="page-login page_cotact">
              <h1 className="title-head-contact a-left">
                <span>Liên hệ với chúng tôi</span>
              </h1>
              <div id="pagelogin" className="margin-top-0">
                <form method="post" action="/postcontact" id="contact" acceptCharset="UTF-8">
                  <div className="form-signup clearfix">
                    <div className="row group_contact">
                      <fieldset className="form-group col-lg-12 col-md-12 col-sm-12 col-xs-12">
                        <input
                          placeholder="Họ và tên"
                          type="text"
                          className="form-control form-control-lg"
                          required
                          name="contact[Name]"
                        />
                      </fieldset>
                      <fieldset className="form-group col-lg-12 col-md-12 col-sm-12 col-xs-12">
                        <input
                          placeholder="Email"
                          type="email"
                          required
                          id="email1"
                          className="form-control form-control-lg"
                          name="contact[email]"
                        />
                      </fieldset>
                      <fieldset className="form-group col-lg-12 col-md-12 col-sm-12 col-xs-12">
                        <textarea
                          placeholder="Nội dung"
                          name="contact[body]"
                          id="comment"
                          className="form-control content-area form-control-lg"
                          rows="5"
                          required
                        ></textarea>
                      </fieldset>
                      <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                        <button type="submit" className="btn btn-primary btn-comment button_gradient">
                          Gửi liên hệ
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Cột bản đồ */}
          <div className="select_maps col-md-8 col-sm-12 col-xs-12">
            <div className="section_mapss margin-bottom-50">
              <div className="box-maps">
                <div className="iFrameMap">
                  <div className="google-map">
                    <div id="contact_map" className="map">
                      <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3723.91200565666!2d105.81368971529523!3d21.03620659289907!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ab128d511a8d%3A0x3440d4c5d63f693!2zMjY2IMSQ4buZaSBD4bqlbiwgTGnhu4V1IEdpYWksIEJhIMSQw6xuaCwgSMOgIE7hu5lpLCBWaeG7h3QgTmFt!5e0!3m2!1svi!2s!4v1553499875578"
                        allowFullScreen
                        title="Google Map"
                      ></iframe>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default Contant
