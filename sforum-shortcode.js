(function () {
  // --- KIỂM TRA & TẠO MENU ---
  const menuId = "master-tools-menu";
  if (document.getElementById(menuId)) {
    document.getElementById(menuId).remove(); // Nếu menu đang mở thì đóng lại
    return;
  }

  // --- DANH SÁCH CÁC HÀM CÔNG CỤ ---

  // 1. Lấy shortcode
  function toolGetShortcode1() {
    try {
      let id = document.querySelector(".comment-container").getAttribute("product-id");
      window.prompt("Lấy ID sản phẩm thành công", "[Product_Info id='" + id + "']");
    } catch (e) {
      alert("Lỗi: Không tìm thấy ID sản phẩm ở phần bình luận.");
    }
  }

  // 2. Lấy shortcode Sforum
  async function toolGetShortcodeSforum() {
    try {
      const response = await fetch(window.location.href);
      const textToSearch = await response.text();
      const regex = /\[Product_Info\s+id=['"]\d+['"]\]/g;
      const matches = textToSearch.match(regex);
      if (!matches) {
        alert("Không tìm thấy shortcode nào trong bài!");
        return;
      }
      const uniqueMatches = [...new Set(matches)];
      const resultText = uniqueMatches.join("\n");
      const oldBox = document.getElementById("sc-extractor-box");
      if (oldBox) oldBox.remove();
      
      const box = document.createElement("div");
      box.id = "sc-extractor-box";
      box.style.cssText = "position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:9999999;background:#fff;padding:20px;border-radius:10px;box-shadow:0 10px 30px rgba(0,0,0,0.3);width:300px;font-family:sans-serif;";
      
      const title = document.createElement("h3");
      title.style.cssText = "margin:0 0 10px;font-size:16px;color:#333;";
      title.innerText = "Danh sách Shortcode (" + uniqueMatches.length + ")";
      
      const textarea = document.createElement("textarea");
      textarea.style.cssText = "width:100%;height:150px;margin-bottom:10px;padding:10px;box-sizing:border-box;border:1px solid #ccc;border-radius:5px;font-family:monospace;";
      textarea.value = resultText;
      
      const closeBtn = document.createElement("button");
      closeBtn.style.cssText = "width:100%;padding:10px;background:#d70018;color:#fff;border:none;border-radius:5px;cursor:pointer;font-weight:bold;";
      closeBtn.innerText = "Copy & Đóng";
      closeBtn.onclick = function () {
        textarea.select();
        document.execCommand("copy");
        box.remove();
      };
      
      box.appendChild(title);
      box.appendChild(textarea);
      box.appendChild(closeBtn);
      document.body.appendChild(box);
    } catch (error) {
      alert("Có lỗi khi tải trang: " + error);
    }
  }

  // 3. Edit trực tiếp
  function toolEditDirectly() {
    fetch(window.location.href)
      .then(function (r) { return r.text(); })
      .then(function (html) {
        var m = html.match(/"detailPost"\:\{"id"\:(\d+)/) || html.match(/"postId"\:(\d+)/) || html.match(/"urlId"\:(\d+)/);
        if (m && m[1]) {
          window.location.href = "https://cms.sforum.vn/s-admin/sforum/news/post/update/" + m[1] + "#primarytab-content";
        } else {
          alert("Không tìm thấy ID bài viết trên trang này.");
        }
      })
      .catch(function (e) { alert("Lỗi khi tải trang: " + e); });
  }

  // 4. Lấy ngày đăng
  function toolGetPublishDate() {
    function extractDatePublished() {
      var scripts = document.querySelectorAll('script[type="application/ld+json"]');
      for (var i = 0; i < scripts.length; i++) {
        try {
          var jsonData = JSON.parse(scripts[i].textContent);
          if (jsonData.datePublished) return jsonData.datePublished.replace(/"/g, "");
        } catch (e) {}
      }
      return null;
    }
    function extractDateFromDataLayer() {
      if (window.dataLayer) {
        for (var i = 0; i < window.dataLayer.length; i++) {
          var item = window.dataLayer[i];
          if (item.articlePublishDate) return item.articlePublishDate;
        }
      }
      return null;
    }
    function formatDate(dateString) {
      if (!dateString) return "";
      var date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        var day = String(date.getDate()).padStart(2, "0"), month = String(date.getMonth() + 1).padStart(2, "0"), year = date.getFullYear();
        return day + "/" + month + "/" + year;
      }
      var match = dateString.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
      if (match) {
        var day = match[1].padStart(2, "0"), month = match[2].padStart(2, "0"), year = match[3];
        return day + "/" + month + "/" + year;
      }
      return "";
    }
    function fallbackCopy(text) {
      var textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      try { document.execCommand("copy"); alert("Đã copy ngày: " + text); } catch (err) {}
      document.body.removeChild(textarea);
    }

    var publishedDate = extractDatePublished() || extractDateFromDataLayer();
    var formattedDate = formatDate(publishedDate);
    if (formattedDate) {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        if (!document.hasFocus()) window.focus();
        setTimeout(function () {
          navigator.clipboard.writeText(formattedDate).then(()=> alert("Đã copy ngày: " + formattedDate)).catch(function () {
            fallbackCopy(formattedDate);
          });
        }, 50);
      } else {
        fallbackCopy(formattedDate);
      }
    } else {
      alert("Không tìm thấy ngày đăng bài!");
    }
  }

  // 5. Lấy key
  function toolGetKey() {
    window.focus();
    let keywords = document.querySelector('meta[name="keywords"]')?.content || document.querySelector('meta[name="news_keywords"]')?.content || "";
    if (keywords) {
      let mainKeyword = keywords.split(",")[0].trim();
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(mainKeyword)
          .then(() => alert("Đã copy Key: " + mainKeyword))
          .catch((err) => {
             // Fallback
             prompt("Copy Key:", mainKeyword);
          });
      } else {
         prompt("Copy Key:", mainKeyword);
      }
    } else {
      alert("Không tìm thấy từ khóa SEO.");
    }
  }

  // --- RENDER GIAO DIỆN MENU NỔI ---
  const menu = document.createElement("div");
  menu.id = menuId;
  menu.style.cssText = "position:fixed;top:20px;right:20px;z-index:9999998;background:#ffffff;border:1px solid #ddd;border-radius:8px;padding:15px;box-shadow:0 4px 15px rgba(0,0,0,0.15);width:220px;font-family:Arial,sans-serif;";

  const header = document.createElement("div");
  header.style.cssText = "display:flex;justify-content:space-between;align-items:center;margin-bottom:15px;border-bottom:1px solid #eee;padding-bottom:10px;";
  
  const title = document.createElement("strong");
  title.innerText = "SForum Tools";
  title.style.color = "#d70018";
  
  const closeMenuBtn = document.createElement("span");
  closeMenuBtn.innerText = "✖";
  closeMenuBtn.style.cssText = "cursor:pointer;color:#999;font-size:14px;font-weight:bold;";
  closeMenuBtn.onclick = function() { menu.remove(); };

  header.appendChild(title);
  header.appendChild(closeMenuBtn);
  menu.appendChild(header);

  // Tạo nút cho từng chức năng
  const tools = [
    { name: "1. Lấy shortcode", func: toolGetShortcode1 },
    { name: "2. Lấy shortcode Sforum", func: toolGetShortcodeSforum },
    { name: "3. Edit trực tiếp", func: toolEditDirectly },
    { name: "4. Lấy ngày đăng", func: toolGetPublishDate },
    { name: "5. Lấy key", func: toolGetKey }
  ];

  tools.forEach(tool => {
    const btn = document.createElement("button");
    btn.innerText = tool.name;
    btn.style.cssText = "display:block;width:100%;margin-bottom:8px;padding:8px;background:#f8f9fa;border:1px solid #ccc;border-radius:4px;cursor:pointer;text-align:left;font-size:13px;color:#333;transition:background 0.2s;";
    btn.onmouseover = () => btn.style.background = "#e2e6ea";
    btn.onmouseout = () => btn.style.background = "#f8f9fa";
    btn.onclick = function() {
        tool.func();
        // Tùy chọn: Thêm menu.remove() ở đây nếu muốn menu tự biến mất sau khi bấm nút
    };
    menu.appendChild(btn);
  });

  document.body.appendChild(menu);
})();