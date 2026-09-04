(function ($) {
  "use strict";

  $(function () {
    const $tabs = $(".tab-btn");
    const $tabPanels = $(".tab-content");
    const $accordionItems = $(".item-acc");

    function activateTab($tab) {
      const panelId = $tab.data("tab");

      $tabs
        .removeClass("active")
        .attr({
          "aria-selected": "false",
          tabindex: "-1"
        });

      $tab
        .addClass("active")
        .attr({
          "aria-selected": "true",
          tabindex: "0"
        });

      $tabPanels
        .removeClass("active")
        .prop("hidden", true);

      $("#" + panelId)
        .addClass("active")
        .prop("hidden", false);
    }

    const $initialTab = $tabs.filter(".active").first().length
      ? $tabs.filter(".active").first()
      : $tabs.first();

    if ($initialTab.length) {
      activateTab($initialTab);
    }

    $tabs.on("click", function () {
      activateTab($(this));
    });

    $tabs.on("keydown", function (event) {
      const currentIndex = $tabs.index(this);
      let nextIndex = currentIndex;

      if (event.key === "ArrowRight") {
        nextIndex = (currentIndex + 1) % $tabs.length;
      } else if (event.key === "ArrowLeft") {
        nextIndex = (currentIndex - 1 + $tabs.length) % $tabs.length;
      } else if (event.key === "Home") {
        nextIndex = 0;
      } else if (event.key === "End") {
        nextIndex = $tabs.length - 1;
      } else {
        return;
      }

      event.preventDefault();
      $tabs.eq(nextIndex).trigger("focus").trigger("click");
    });

    // Set the initial accordion state from the HTML classes.
    $accordionItems.each(function () {
      const $item = $(this);
      const isOpen = $item.hasClass("active");

      $item.find(".acc-toggle").attr("aria-expanded", String(isOpen));
      $item.find(".acc-content").prop("hidden", !isOpen).toggle(isOpen);
    });

    $(".acc-header").on("click", function () {
      const $item = $(this).closest(".item-acc");
      const $panel = $item.find(".acc-content").first();
      const shouldOpen = !$item.hasClass("active");

      $accordionItems.each(function () {
        const $otherItem = $(this);
        const $otherPanel = $otherItem.find(".acc-content").first();

        $otherItem.removeClass("active");
        $otherItem.find(".acc-toggle").attr("aria-expanded", "false");

        if ($otherPanel.is(":visible")) {
          $otherPanel.stop(true, true).slideUp(300, function () {
            $otherPanel.prop("hidden", true);
          });
        } else {
          $otherPanel.prop("hidden", true);
        }
      });

      if (shouldOpen) {
        $item.addClass("active");
        $item.find(".acc-toggle").attr("aria-expanded", "true");
        $panel
          .stop(true, true)
          .prop("hidden", false)
          .hide()
          .slideDown(300);
      }
    });

    // Prevent placeholder links from jumping to the top of the page.
    $(document).on("click", 'a[href="#"]', function (event) {
      event.preventDefault();
    });
  });



})(jQuery);

$(document).ready(function () {
/*
 * AI Chat Interface
 * Later you can connect this to your own backend API.
 */
const CHAT_API_ENDPOINT = "/wp-json/minder-chat/v1/message";
// For non-WordPress projects, you can change it to:
// const CHAT_API_ENDPOINT = "/api/chat";

let aiChatHistory = [
  {
    role: "assistant",
    content: "Hi! I’m the Minder Memory assistant. How can I help you today?"
  }
];

function escapeHtml(text) {
  return $("<div>").text(text).html();
}

function scrollChatToBottom() {
  const chatBody = $("#aiChatBody");
  chatBody.scrollTop(chatBody[0].scrollHeight);
}

function addChatMessage(role, message) {
  const safeMessage = escapeHtml(message);

  if (role === "user") {
    $("#aiChatBody").append(`
      <div class="ai-message user">
        <div class="ai-bubble">${safeMessage}</div>
      </div>
    `);
  } else {
    $("#aiChatBody").append(`
      <div class="ai-message bot">
        <div class="ai-avatar">M</div>
        <div class="ai-bubble">${safeMessage}</div>
      </div>
    `);
  }

  scrollChatToBottom();
}

function showTypingMessage() {
  $("#aiChatBody").append(`
    <div class="ai-message bot ai-typing-message" id="aiTypingMessage">
      <div class="ai-avatar">M</div>
      <div class="ai-bubble">
        <div class="ai-typing">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  `);

  scrollChatToBottom();
}

function removeTypingMessage() {
  $("#aiTypingMessage").remove();
}

function getDemoBotReply(userMessage) {
  const message = userMessage.toLowerCase();

  if (message.includes("insurance")) {
    return "Our team can help answer insurance coverage questions. Please call 855-264-6337 or send us your details through the contact form so we can guide you.";
  }

  if (message.includes("schedule") || message.includes("appointment") || message.includes("seen")) {
    return "Scheduling availability can vary. Our team is available Monday-Friday, 8am - 8pm EST, and can help you get started.";
  }

  if (message.includes("evaluation") || message.includes("neuropsychological") || message.includes("psychological")) {
    return "Minder Memory can help with neuropsychological and psychological evaluation questions. Please share what type of evaluation you are looking for.";
  }

  if (message.includes("phone") || message.includes("call")) {
    return "You can call our customer service team at 855-264-6337, Monday-Friday from 8am - 8pm EST.";
  }

  return "Thanks for your question. I can help with evaluations, insurance, scheduling, referrals, and general support. For direct assistance, you can also call 855-264-6337.";
}

function sendChatMessage(userMessage) {
  $("#aiChatSend").prop("disabled", true);
  showTypingMessage();

  /*
   * TEMPORARY DEMO MODE
   * This gives a local response until your real API is ready.
   */
  setTimeout(function () {
    removeTypingMessage();

    const botReply = getDemoBotReply(userMessage);

    aiChatHistory.push({
      role: "assistant",
      content: botReply
    });

    addChatMessage("assistant", botReply);

    $("#aiChatSend").prop("disabled", false);
    $("#aiChatInput").focus();
  }, 900);

  /*
   * REAL API VERSION
   * When your backend API is ready, remove the demo setTimeout above
   * and uncomment this AJAX code.
   *
   * Your backend should receive:
   * {
   *   message: userMessage,
   *   history: aiChatHistory
   * }
   *
   * Your backend should return:
   * {
   *   reply: "Assistant response here"
   * }
   */

  /*
  $.ajax({
    url: CHAT_API_ENDPOINT,
    method: "POST",
    contentType: "application/json",
    data: JSON.stringify({
      message: userMessage,
      history: aiChatHistory
    }),
    success: function (response) {
      removeTypingMessage();

      const botReply = response.reply || "Thank you. Our team can help with that.";

      aiChatHistory.push({
        role: "assistant",
        content: botReply
      });

      addChatMessage("assistant", botReply);
    },
    error: function () {
      removeTypingMessage();

      addChatMessage(
        "assistant",
        "Sorry, I could not connect right now. Please call us at 855-264-6337 or try again later."
      );
    },
    complete: function () {
      $("#aiChatSend").prop("disabled", false);
      $("#aiChatInput").focus();
    }
  });
  */
}

$("#aiChatToggle").on("click", function () {
  $("#aiChatBox").addClass("open");
  $("#aiChatToggle").hide();
  $("#aiChatInput").focus();
  scrollChatToBottom();
});

$("#aiChatClose").on("click", function () {
  $("#aiChatBox").removeClass("open");
  $("#aiChatToggle").show();
});

$("#aiChatForm").on("submit", function (event) {
  event.preventDefault();

  const userMessage = $.trim($("#aiChatInput").val());

  if (userMessage === "") {
    return;
  }

  aiChatHistory.push({
    role: "user",
    content: userMessage
  });

  addChatMessage("user", userMessage);

  $("#aiChatInput").val("");
  sendChatMessage(userMessage);
});

$("#aiChatInput").on("keydown", function (event) {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    $("#aiChatForm").trigger("submit");
  }
});

$(".ai-suggestion").on("click", function () {
  const suggestionText = $(this).text();
  $("#aiChatInput").val(suggestionText);
  $("#aiChatForm").trigger("submit");
});
});

jQuery(document).ready(function ($) {

  /*
   * ============================================
   * SYMPTOM INVENTORIES ONLY
   * This does NOT affect the existing accordion.
   * ============================================
   */

  $(".symptom-inventories").on("click", function (event) {

    event.preventDefault();
    event.stopPropagation();

    const $inventory = $(this);

    $inventory.toggleClass("inventory-open");

  });

});

(function ($) {
  "use strict";

  $(function () {
    const $tabs = $(".tab-btn");
    const $tabPanels = $(".tab-content");
    const $accordionItems = $(".item-acc");

    function activateTab($tab) {
      const panelId = $tab.data("tab");

      $tabs
        .removeClass("active")
        .attr({
          "aria-selected": "false",
          tabindex: "-1"
        });

      $tab
        .addClass("active")
        .attr({
          "aria-selected": "true",
          tabindex: "0"
        });

      $tabPanels
        .removeClass("active")
        .prop("hidden", true);

      $("#" + panelId)
        .addClass("active")
        .prop("hidden", false);
    }

    const $initialTab = $tabs.filter(".active").first().length
      ? $tabs.filter(".active").first()
      : $tabs.first();

    if ($initialTab.length) {
      activateTab($initialTab);
    }

    $tabs.on("click", function () {
      activateTab($(this));
    });

    $tabs.on("keydown", function (event) {
      const currentIndex = $tabs.index(this);
      let nextIndex = currentIndex;

      if (event.key === "ArrowRight") {
        nextIndex = (currentIndex + 1) % $tabs.length;
      } else if (event.key === "ArrowLeft") {
        nextIndex = (currentIndex - 1 + $tabs.length) % $tabs.length;
      } else if (event.key === "Home") {
        nextIndex = 0;
      } else if (event.key === "End") {
        nextIndex = $tabs.length - 1;
      } else {
        return;
      }

      event.preventDefault();
      $tabs.eq(nextIndex).trigger("focus").trigger("click");
    });

    // Set the initial accordion state from the HTML classes.
    $accordionItems.each(function () {
      const $item = $(this);
      const isOpen = $item.hasClass("active");

      $item.find(".acc-toggle").attr("aria-expanded", String(isOpen));
      $item.find(".acc-content").prop("hidden", !isOpen).toggle(isOpen);
    });

    $(".acc-header").on("click", function () {
      const $item = $(this).closest(".item-acc");
      const $panel = $item.find(".acc-content").first();
      const shouldOpen = !$item.hasClass("active");

      $accordionItems.each(function () {
        const $otherItem = $(this);
        const $otherPanel = $otherItem.find(".acc-content").first();

        $otherItem.removeClass("active");
        $otherItem.find(".acc-toggle").attr("aria-expanded", "false");

        if ($otherPanel.is(":visible")) {
          $otherPanel.stop(true, true).slideUp(300, function () {
            $otherPanel.prop("hidden", true);
          });
        } else {
          $otherPanel.prop("hidden", true);
        }
      });

      if (shouldOpen) {
        $item.addClass("active");
        $item.find(".acc-toggle").attr("aria-expanded", "true");
        $panel
          .stop(true, true)
          .prop("hidden", false)
          .hide()
          .slideDown(300);
      }
    });

    // Prevent placeholder links from jumping to the top of the page.
    $(document).on("click", 'a[href="#"]', function (event) {
      event.preventDefault();
    });
  });



})(jQuery);

$(document).ready(function () {
/*
 * AI Chat Interface
 * Later you can connect this to your own backend API.
 */
const CHAT_API_ENDPOINT = "/wp-json/minder-chat/v1/message";
// For non-WordPress projects, you can change it to:
// const CHAT_API_ENDPOINT = "/api/chat";

let aiChatHistory = [
  {
    role: "assistant",
    content: "Hi! I’m the Minder Memory assistant. How can I help you today?"
  }
];

function escapeHtml(text) {
  return $("<div>").text(text).html();
}

function scrollChatToBottom() {
  const chatBody = $("#aiChatBody");
  chatBody.scrollTop(chatBody[0].scrollHeight);
}

function addChatMessage(role, message) {
  const safeMessage = escapeHtml(message);

  if (role === "user") {
    $("#aiChatBody").append(`
      <div class="ai-message user">
        <div class="ai-bubble">${safeMessage}</div>
      </div>
    `);
  } else {
    $("#aiChatBody").append(`
      <div class="ai-message bot">
        <div class="ai-avatar">M</div>
        <div class="ai-bubble">${safeMessage}</div>
      </div>
    `);
  }

  scrollChatToBottom();
}

function showTypingMessage() {
  $("#aiChatBody").append(`
    <div class="ai-message bot ai-typing-message" id="aiTypingMessage">
      <div class="ai-avatar">M</div>
      <div class="ai-bubble">
        <div class="ai-typing">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  `);

  scrollChatToBottom();
}

function removeTypingMessage() {
  $("#aiTypingMessage").remove();
}

function getDemoBotReply(userMessage) {
  const message = userMessage.toLowerCase();

  if (message.includes("insurance")) {
    return "Our team can help answer insurance coverage questions. Please call 855-264-6337 or send us your details through the contact form so we can guide you.";
  }

  if (message.includes("schedule") || message.includes("appointment") || message.includes("seen")) {
    return "Scheduling availability can vary. Our team is available Monday-Friday, 8am - 8pm EST, and can help you get started.";
  }

  if (message.includes("evaluation") || message.includes("neuropsychological") || message.includes("psychological")) {
    return "Minder Memory can help with neuropsychological and psychological evaluation questions. Please share what type of evaluation you are looking for.";
  }

  if (message.includes("phone") || message.includes("call")) {
    return "You can call our customer service team at 855-264-6337, Monday-Friday from 8am - 8pm EST.";
  }

  return "Thanks for your question. I can help with evaluations, insurance, scheduling, referrals, and general support. For direct assistance, you can also call 855-264-6337.";
}

function sendChatMessage(userMessage) {
  $("#aiChatSend").prop("disabled", true);
  showTypingMessage();

  /*
   * TEMPORARY DEMO MODE
   * This gives a local response until your real API is ready.
   */
  setTimeout(function () {
    removeTypingMessage();

    const botReply = getDemoBotReply(userMessage);

    aiChatHistory.push({
      role: "assistant",
      content: botReply
    });

    addChatMessage("assistant", botReply);

    $("#aiChatSend").prop("disabled", false);
    $("#aiChatInput").focus();
  }, 900);

  /*
   * REAL API VERSION
   * When your backend API is ready, remove the demo setTimeout above
   * and uncomment this AJAX code.
   *
   * Your backend should receive:
   * {
   *   message: userMessage,
   *   history: aiChatHistory
   * }
   *
   * Your backend should return:
   * {
   *   reply: "Assistant response here"
   * }
   */

  /*
  $.ajax({
    url: CHAT_API_ENDPOINT,
    method: "POST",
    contentType: "application/json",
    data: JSON.stringify({
      message: userMessage,
      history: aiChatHistory
    }),
    success: function (response) {
      removeTypingMessage();

      const botReply = response.reply || "Thank you. Our team can help with that.";

      aiChatHistory.push({
        role: "assistant",
        content: botReply
      });

      addChatMessage("assistant", botReply);
    },
    error: function () {
      removeTypingMessage();

      addChatMessage(
        "assistant",
        "Sorry, I could not connect right now. Please call us at 855-264-6337 or try again later."
      );
    },
    complete: function () {
      $("#aiChatSend").prop("disabled", false);
      $("#aiChatInput").focus();
    }
  });
  */
}

$("#aiChatToggle").on("click", function () {
  $("#aiChatBox").addClass("open");
  $("#aiChatToggle").hide();
  $("#aiChatInput").focus();
  scrollChatToBottom();
});

$("#aiChatClose").on("click", function () {
  $("#aiChatBox").removeClass("open");
  $("#aiChatToggle").show();
});

$("#aiChatForm").on("submit", function (event) {
  event.preventDefault();

  const userMessage = $.trim($("#aiChatInput").val());

  if (userMessage === "") {
    return;
  }

  aiChatHistory.push({
    role: "user",
    content: userMessage
  });

  addChatMessage("user", userMessage);

  $("#aiChatInput").val("");
  sendChatMessage(userMessage);
});

$("#aiChatInput").on("keydown", function (event) {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    $("#aiChatForm").trigger("submit");
  }
});

$(".ai-suggestion").on("click", function () {
  const suggestionText = $(this).text();
  $("#aiChatInput").val(suggestionText);
  $("#aiChatForm").trigger("submit");
});
});

jQuery(document).ready(function ($) {

  /*
   * ============================================
   * SYMPTOM INVENTORIES ONLY
   * This does NOT affect the existing accordion.
   * ============================================
   */

  $(".symptom-inventories").on("click", function (event) {

    event.preventDefault();
    event.stopPropagation();

    const $inventory = $(this);

    $inventory.toggleClass("inventory-open");

  });

});

jQuery(document).ready(function ($) {

  function updateEvaluationProgress() {

    let completed = 0;

    // Normal checkboxes
    $('.evaluation-complete[type="checkbox"]').each(function () {
      if ($(this).is(':checked')) {
        completed++;
      }
    });

    // Confidence
    if ($('.confidence-complete').val() === '1') {
      completed++;
    }

    // Commitment
    if ($('.commitment-complete').val() === '1') {
      completed++;
    }

    // Zoom
    if ($('.zoom-complete').val() === '1') {
      completed++;
    }

    $('#evaluation-progress').text(completed + ' of 10 Complete');
  }


  // Confidence
  $('input[name="confidence"]').on('change', function () {

    let value = parseInt($(this).val());

    if (value >= 8) {

      $('.confidence-warning').hide();

      $('.confidence-complete').val('1');

    } else {

      $('.confidence-warning').show();

      $('.confidence-complete').val('0');
    }

    updateEvaluationProgress();
  });


  // Commitment
  $('input[name="commitment"]').on('change', function () {

    let value = parseInt($(this).val());

    if (value >= 8) {

      $('.commitment-warning').hide();

      $('.commitment-complete').val('1');

    } else {

      $('.commitment-warning').show();

      $('.commitment-complete').val('0');
    }

    updateEvaluationProgress();
  });


  // Zoom test
  $('.zoom-device-check').on('change', function () {

    let total = $('.zoom-device-check').length;

    let checked = $('.zoom-device-check:checked').length;

    if (total === checked) {

      $('.zoom-complete').val('1');

    } else {

      $('.zoom-complete').val('0');
    }

    updateEvaluationProgress();
  });


  // Normal checklist items
  $('.evaluation-complete[type="checkbox"]').on('change', function () {

    updateEvaluationProgress();

  });


  updateEvaluationProgress();

});