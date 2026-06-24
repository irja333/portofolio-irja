function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);

    // Email tujuan pengiriman laporan
    var recipient = "dugong.naturalacehcorp@gmail.com";
    var subject = " LAPORAN PENAMPAKAN DUGONG: " + data.nama;

    // Membangun isi email dalam format HTML
    // Mapping kondisi ke label dan warna
    var kondisiLabel = "Berenang Bebas";
    var kondisiColor = "#10b981"; // Hijau
    if (data.kondisi === "terjerat") {
      kondisiLabel = "TERJERAT JARING (BYCATCH)";
      kondisiColor = "#f59e0b"; // Oranye/Amber
    } else if (data.kondisi === "terdampar_hidup") {
      kondisiLabel = "TERDAMPAR (HIDUP)";
      kondisiColor = "#3b82f6"; // Biru
    } else if (data.kondisi === "terdampar_mati") {
      kondisiLabel = "TERDAMPAR (MATI)";
      kondisiColor = "#ef4444"; // Merah
    }

    var attachments = [];
    var inlineImages = {};

    // Decode foto base64 jika ada
    if (data.photo_base64 && data.photo_base64.indexOf(',') > -1) {
      var parts = data.photo_base64.split(",");
      var mimeType = parts[0].split(":")[1].split(";")[0];
      var base64Data = parts[1];
      var decoded = Utilities.base64Decode(base64Data);
      var blob = Utilities.newBlob(decoded, mimeType, "bukti_penampakan_" + data.nama.replace(/\s+/g, '_') + ".jpg");
      attachments.push(blob);
      inlineImages["preview_image"] = blob;
    }

    var htmlBody =
      "<div style='background-color: #081017; padding: 40px 20px; font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Helvetica, Arial, sans-serif; min-height: 100%; color: #f8fafc;'>" +
      "  <div style='max-width: 600px; margin: 0 auto; background-color: #0c1923; border: 1px solid rgba(0, 240, 255, 0.25); border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 240, 255, 0.1);'>" +
      "    " +
      "    <!-- Header Banner -->" +
      "    <div style='background: linear-gradient(135deg, #062c3d 0%, #020d14 100%); padding: 25px; border-bottom: 2px solid #00f0ff; text-align: center;'>" +
      "      <h1 style='margin: 0; font-size: 20px; letter-spacing: 1.5px; color: #00f0ff; font-weight: 800; text-transform: uppercase;'>Dugong Conservation Aceh</h1>" +
      "      <p style='margin: 5px 0 0 0; font-size: 12px; color: #8ab4f8;'>LAPORAN PENAMPAKAN TERVERIFIKASI GPS</p>" +
      "    </div>" +
      "    " +
      "    <!-- Content Container -->" +
      "    <div style='padding: 30px;'>" +
      "      <h2 style='margin-top: 0; margin-bottom: 20px; font-size: 18px; color: #ffffff; border-bottom: 1px solid #0a5270; padding-bottom: 10px;'>Detail Informasi</h2>" +
      "      " +
      "      <table style='width: 100%; border-collapse: collapse; margin-bottom: 25px;'>" +
      "        <!-- Nama Pelapor -->" +
      "        <tr>" +
      "          <td style='padding: 12px 10px; border-bottom: 1px solid rgba(10, 82, 112, 0.3); font-size: 14px; color: #8ab4f8; width: 35%; font-weight: 600;'>Nama Pelapor</td>" +
      "          <td style='padding: 12px 10px; border-bottom: 1px solid rgba(10, 82, 112, 0.3); font-size: 14px; color: #ffffff; font-weight: bold;'>" + data.nama + "</td>" +
      "        </tr>" +
      "        <!-- WhatsApp -->" +
      "        <tr>" +
      "          <td style='padding: 12px 10px; border-bottom: 1px solid rgba(10, 82, 112, 0.3); font-size: 14px; color: #8ab4f8; font-weight: 600;'>Nomor WhatsApp</td>" +
      "          <td style='padding: 12px 10px; border-bottom: 1px solid rgba(10, 82, 112, 0.3); font-size: 14px;'>" +
      "            <a href='https://wa.me/" + data.whatsapp.replace(/\D/g, '') + "' style='background-color: #10b981; color: #ffffff; text-decoration: none; padding: 6px 14px; border-radius: 12px; font-size: 12px; font-weight: bold; display: inline-block;'>" +
      "              Hubungi WhatsApp (" + data.whatsapp + ")" +
      "            </a>" +
      "          </td>" +
      "        </tr>" +
      "        <!-- Kondisi -->" +
      "        <tr>" +
      "          <td style='padding: 12px 10px; border-bottom: 1px solid rgba(10, 82, 112, 0.3); font-size: 14px; color: #8ab4f8; font-weight: 600;'>Kondisi Dugong</td>" +
      "          <td style='padding: 12px 10px; border-bottom: 1px solid rgba(10, 82, 112, 0.3); font-size: 14px;'>" +
      "            <span style='background-color: " + kondisiColor + "; color: #ffffff; padding: 4px 10px; border-radius: 8px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; display: inline-block;'>" +
      "              " + kondisiLabel + "" +
      "            </span>" +
      "          </td>" +
      "        </tr>" +
      "        <!-- Waktu -->" +
      "        <tr>" +
      "          <td style='padding: 12px 10px; border-bottom: 1px solid rgba(10, 82, 112, 0.3); font-size: 14px; color: #8ab4f8; font-weight: 600;'>Waktu Penampakan</td>" +
      "          <td style='padding: 12px 10px; border-bottom: 1px solid rgba(10, 82, 112, 0.3); font-size: 14px; color: #ffffff; font-family: monospace;'>" + data.waktu + " WIB</td>" +
      "        </tr>" +
      "        <!-- GPS -->" +
      "        <tr>" +
      "          <td style='padding: 12px 10px; border-bottom: 1px solid rgba(10, 82, 112, 0.3); font-size: 14px; color: #8ab4f8; font-weight: 600;'>Koordinat GPS</td>" +
      "          <td style='padding: 12px 10px; border-bottom: 1px solid rgba(10, 82, 112, 0.3); font-size: 13px; color: #ffffff; font-family: monospace;'>" +
      "            " + data.latitude + ", " + data.longitude + " <br>" +
      "            <span style='color: #8ab4f8; font-size: 11px;'>(Akurasi: " + data.akurasi + ")</span>" +
      "          </td>" +
      "        </tr>" +
      "        <!-- Catatan -->" +
      "        <tr>" +
      "          <td style='padding: 12px 10px; border-bottom: 1px solid rgba(10, 82, 112, 0.3); font-size: 14px; color: #8ab4f8; font-weight: 600;'>Catatan Tambahan</td>" +
      "          <td style='padding: 12px 10px; border-bottom: 1px solid rgba(10, 82, 112, 0.3); font-size: 14px; color: #ffffff; line-height: 1.4;'>" + (data.catatan ? data.catatan : '-') + "</td>" +
      "        </tr>" +
      "      </table>" +
      "      " +
      "      <!-- Action Button (Google Maps) -->" +
      "      <div style='text-align: center; margin-top: 15px; margin-bottom: 30px;'>" +
      "        <a href='" + data.maps_url + "' style='background: linear-gradient(135deg, #00f0ff 0%, #0a5270 100%); color: #020d14; text-decoration: none; padding: 12px 24px; border-radius: 30px; font-weight: bold; font-size: 14px; display: inline-block; box-shadow: 0 4px 12px rgba(0, 240, 255, 0.3);'>" +
      "          BUKA LOKASI DI GOOGLE MAPS" +
      "        </a>" +
      "      </div>" +
      "      " +
      "      <!-- Photo Section -->" +
      "      <h2 style='font-size: 18px; color: #ffffff; border-bottom: 1px solid #0a5270; padding-bottom: 10px; margin-bottom: 15px;'>Foto Bukti Penampakan</h2>" +
      "      <div style='background-color: #06121b; border: 1px solid rgba(10, 82, 112, 0.5); padding: 10px; border-radius: 12px; text-align: center;'>" +
      "        <img src='cid:preview_image' style='max-width: 100%; border-radius: 8px; border: 1px solid #0a5270; display: block; margin: 0 auto;' alt='Bukti Penampakan'>" +
      "      </div>" +
      "      " +
      "    </div>" +
      "    " +
      "    <!-- Footer Section -->" +
      "    <div style='background-color: #040c13; padding: 20px; border-top: 1px solid rgba(0, 240, 255, 0.15); text-align: center; font-size: 11px; color: #64748b;'>" +
      "      <p style='margin: 0;'>Email ini dikirim secara otomatis oleh sistem Laporan Penampakan Dugong Natural Aceh Corp.</p>" +
      "      <p style='margin: 5px 0 0 0;'>&copy; 2026 Dugong Natural Aceh Corp. Hak Cipta Dilindungi.</p>" +
      "    </div>" +
      "  </div>" +
      "</div>";

    // Mengirim email menggunakan GmailApp / MailApp
    GmailApp.sendEmail(recipient, subject, "", {
      htmlBody: htmlBody,
      attachments: attachments,
      inlineImages: inlineImages
    });

    return ContentService.createTextOutput(JSON.stringify({ success: true, message: "Laporan berhasil dikirim ke email." }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
