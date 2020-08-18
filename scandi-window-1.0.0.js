;(function (w) {
	/**
	 * ScandiWindow
	 */
	class ScandiWindow {
		constructor(data) {
			this.chatpage = (data.chatpage || 'go').toString().toLowerCase().replace(/^\s+|\s+$/g, '');
			this.chatpage = this.chatpage.replace(/\s+/g, '_');
			this.path = data.path || '';

			this.chatpageName = '';

			try {
				this.origin = data.origin || ORIGIN;
			} catch (err) {
				this.origin = 'https://w.dev-scandi.com/';
			}

			this.isOrigin = (
				(window.location.hostname !== 'localhost') &&
				(this.origin.indexOf(window.location.hostname.replace(location.hostname.split('.').shift(), '')) !== -1) &&
				location.href !== this.origin.replace('w.', '')
			);

			this.sButton = {
				id: `scandi-button-${this.chatpage}`,
				icon: (data.button && data.button.icon) || `${this.origin}images/messages-logo.png`,
				width: (data.button && data.button.width) || 65,
				height: (data.button && data.button.height) || 65,
				bottom: (data.button && data.button.bottom) || 50,
				right: (data.button && data.button.right && !data.button.left) ? data.button.right : (!data.button ? 50 : 'auto'),
				left: (data.button && data.button.left) || 'auto',
				mBottom: (data.button && data.button.mobileBottom) || 20,
				mRight: (data.button && data.button.mobileRight && !data.button.mobileLeft) ? data.button.mobileRight : (!data.button ? 20 : 'auto'),
				mLeft: (data.button && data.button.mobileLeft) || 'auto',
				bPadding: 10,
				bBorderWidth: 1,
				bPageNameHeight: 15,
				badgeCount: 0,
				node: null,
				badgeCountNode: null,
				iconNode: null,
				messageNode: null,
				coverNode: null

			};

			this.sWindow = {
				id: `scandi-window-${this.chatpage}`,
				width: (data.window && data.window.width) || 370,
				height: (data.window && data.window.height) || 650,
				bottom: (data.window && data.window.bottom) || 0,
				top: (data.window && data.window.top) || 'auto',
				right: (data.window && data.window.right && !data.window.left) ? data.window.right : (!data.window ? 50 : 'auto'),
				left: (data.window && data.window.left) || 'auto',
				triggerLinkCallback: null,
				hided: true,
				routeHistory: [],
				node: null,
				joinNowButtonNode: null,
				loginPromoteNode: null,
				spinnerNode: null,
				poweredByNode: null
			};

			this.iframe = {
				id: `scandi-${this.chatpage}`,
				frameBorder: 0,
				width: '100%',
				height: '100%',
				src: `${this.origin}${this.chatpage}${this.path}?chatpage=${this.chatpage}&origin=${this.isOrigin}`,
				srcBroadcast: `${this.origin}${this.chatpage}/broadcast?chatpage=${this.chatpage}`,
				node: null
			};

			this.firstTimeLoad = false;

			this.mobileClass = (
				(/android|webos|iphone|blackberry|iemobile|opera mini/i.test(navigator.userAgent.toLowerCase())) ||
				(window.innerWidth <= 600 && window.innerHeight <= 900)
			) ? 'mobile' : '';
			this.isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);


			this.init();
		}

		/**
		 * Set Styles
		 */
		setupStyles() {
			this.CSS = `
				#${this.sButton.id}.d-visible-${this.chatpage}{
					display:inline-block;
				}
			
				#${this.sButton.id}{
					display:none;
					position:fixed;
					bottom: ${this.sButton.bottom}px;
					right: ${(this.sButton.right !== 'auto') ? this.sButton.right + 'px' : this.sButton.right};
					left: ${(this.sButton.left !== 'auto') ? this.sButton.left + 'px' : this.sButton.left};
					z-index:999999;
					cursor:pointer;
				}
				
				#${this.sButton.id}.sc-broadcast-button-message {
					bottom: ${Number(this.sButton.bottom) - this.sButton.bPadding - this.sButton.bBorderWidth}px;
					right: ${(this.sButton.right !== 'auto') ? (Number(this.sButton.right) - this.sButton.bPadding - this.sButton.bBorderWidth) + 'px' : this.sButton.right};
					left: ${(this.sButton.left !== 'auto') ? (Number(this.sButton.left) - this.sButton.bPadding - this.sButton.bBorderWidth) + 'px' : this.sButton.left};
				}
				
				#${this.sButton.id} #${this.sButton.id}-cover:after {
				    display: block;
				    clear: both;
					content: "";
				} 
				
				#${this.sButton.id} .${this.sButton.id}-icon {
					position: relative;
					float: left;
				}
				
				#${this.sButton.id} .${this.sButton.id}-message {
					width: calc(100% - ${this.sButton.height + this.sButton.bPadding}px);
					display: none;
					position: relative;
					float: left;
					font-family:sans-serif;
					font-size:15px;
					font-weight: bold;
					padding-left: ${this.sButton.bPadding}px;
					height: ${this.sButton.height - this.sButton.bPageNameHeight}px;
					line-height: ${this.sButton.height - this.sButton.bPageNameHeight - 3}px;
				}
						
				#${this.sButton.id} .${this.sButton.id}-message span.sc-button-message {
					display: inline-block;
					vertical-align: middle;
					line-height: normal;
				}
				
				#${this.sButton.id} .${this.sButton.id}-message span.sc-button-message-chatpage {
					display: inline-block;
					position: absolute;
					left: ${this.sButton.bPadding}px;
					bottom: -${this.sButton.bPageNameHeight}px;
					font-size: 12px;
                    color: #9B9B9B;
                    font-family:sans-serif;
                    font-weight:normal;
                    line-height: ${this.sButton.bPageNameHeight}px;
                    height: ${this.sButton.bPageNameHeight}px;
				}
				
				#${this.sButton.id} .${this.sButton.id}-message span.sc-button-m {
					display: inline-block;
					vertical-align: middle;
					line-height: normal;
				}
				
				#${this.sButton.id} #${this.sButton.id}-cover.sc-show-button-message {
					max-width: 320px;
					min-width: 270px;
					padding: ${this.sButton.bPadding}px;
					background: #ffffff;
					box-shadow: 3px 3px 4px 0 rgba(219,219,219,0.5);
					border-top-left-radius: ${(this.sButton.height / 2) + this.sButton.bPadding + (this.sButton.bBorderWidth * 2)}px;
                    border-bottom-left-radius: ${(this.sButton.height / 2) + this.sButton.bPadding + (this.sButton.bBorderWidth * 2)}px;
				}
				
				#${this.sButton.id} #${this.sButton.id}-cover.sc-show-button-message.sc-float-right {
					border-top-left-radius: 0;
                    border-bottom-left-radius: 0;
                    border-top-right-radius: ${(this.sButton.height / 2) + this.sButton.bPadding + (this.sButton.bBorderWidth * 2)}px;
                    border-bottom-right-radius: ${(this.sButton.height / 2) + this.sButton.bPadding + (this.sButton.bBorderWidth * 2)}px;
				}
				
				#${this.sButton.id} #${this.sButton.id}-cover.sc-show-button-message.sc-float-right .${this.sButton.id}-icon .sc-badge{
				    right: auto;
				    left: -5px;
				}
				
				#${this.sButton.id} #${this.sButton.id}-cover.sc-show-button-message.sc-float-right .${this.sButton.id}-message {
					padding-left: 0;
					padding-right: ${this.sButton.bPadding}px;
					text-align: right;
				}
				
				#${this.sButton.id} #${this.sButton.id}-cover.sc-show-button-message.sc-float-right .${this.sButton.id}-message span.sc-button-message-chatpage {
					left: auto;
					right: ${this.sButton.bPadding}px;
				}
				
				#${this.sButton.id} #${this.sButton.id}-cover.sc-show-button-message .${this.sButton.id}-message {
					display: block;	
				}
				
				#${this.sButton.id} #${this.sButton.id}-cover.sc-show-button-message img {
					box-shadow: none;
					position: relative;
					top: ${(this.sButton.icon.indexOf('/messages-logo.png') !== -1) ? '-1px' : 'auto'};
				}
				
				
				#${this.sButton.id} #${this.sButton.id}-cover.sc-float-right .${this.sButton.id}-icon,
				#${this.sButton.id} #${this.sButton.id}-cover.sc-float-right .${this.sButton.id}-message {
				    float: right;
				} 
				
				#${this.sButton.id} .${this.sButton.id}-icon .sc-badge{
					display: none;
					position: absolute;
				    width: 27px;
				    height: 27px;
				    border-radius: 100%;
				    background: #FF0000;
				    top: -8px;
				    right: -5px;
				    box-shadow: 0 0 2px 1px rgba(0,0,0,0.2);
				    border: 1px solid #fff;
				    font-size: 14px;
				    color: #fff;
				    text-align: center;
				    line-height: 27px;
				}
				
				#${this.sButton.id}.sc-broadcast-badge .${this.sButton.id}-icon .sc-badge{
					display: inline-block;
				}
				
				@media (max-width: 900px) {
					#${this.sButton.id}{
						bottom: ${this.sButton.mBottom}px;
						right: ${(this.sButton.mRight !== 'auto') ? this.sButton.mRight + 'px' : this.sButton.mRight};
						left: ${(this.sButton.mLeft !== 'auto') ? this.sButton.mLeft + 'px' : this.sButton.mLeft};
					}
					
					#${this.sButton.id}.sc-broadcast-button-message {
						bottom: ${this.sButton.mBottom - this.sButton.bPadding - this.sButton.bBorderWidth}px;
						right: ${((this.sButton.mRight !== 'auto') ? this.sButton.mRight : this.sButton.mLeft) - (this.sButton.bPadding - this.sButton.bBorderWidth)}px;
						left: ${((this.sButton.mLeftt !== 'auto') ? this.sButton.mLeft : this.sButton.mRight) - (this.sButton.bPadding - this.sButton.bBorderWidth)}px;
					}
				}
				
				#${this.sButton.id} img{
					display:inline-block;
					width: ${this.sButton.width}px;
					height: ${(this.sButton.icon.indexOf('/messages-logo.png') !== -1) ? 'auto' : `${this.sButton.height}px`};
					border-radius: ${(this.sButton.icon.indexOf('/messages-logo.png') !== -1) ? 'none' : '100%'};
					box-shadow: ${(this.sButton.icon.indexOf('/messages-logo.png') !== -1) ? 'none' : '0 1px 3px 1px rgba(0, 0, 0, 0.4)'};
				}
				
				#${this.sWindow.id}.d-visible-${this.chatpage}{
					opacity: 1;
					bottom: ${this.sWindow.bottom}px;
					top: ${(this.sWindow.top !== 'auto') ? this.sWindow.top + 'px' : this.sWindow.top};
				}
				
				#${this.sWindow.id}{
					opacity: 0;
					display: flex;
					flex-direction: column;
					position:fixed;
					bottom: -9999px;
					width: ${this.sWindow.width}px;
					height: ${(this.sWindow.height !== 'auto') ? this.sWindow.height + 'px' : this.sWindow.height};
					right: ${(this.sWindow.right !== 'auto') ? this.sWindow.right + 'px' : this.sWindow.right};
					left: ${(this.sWindow.left !== 'auto') ? (this.isOrigin ? (this.sWindow.left + '%') : (this.sWindow.left + 'px')) : this.sWindow.left};
					margin-left: ${(this.isOrigin) ? '-' + this.sWindow.width / 2 : 0}px;
					z-index:999999;
					overflow:hidden;
					font-family:sans-serif;
					font-size:14px;
					background-color:#fff;
					border:1px solid #D8D8D8;
					border-top-left-radius:10px;
					border-top-right-radius:10px;
					box-shadow:0 0 3px 2px rgba(0,0,0,0.1);
					-webkit-overflow-scrolling: touch;
					
					-webkit-transition: opacity 0.5s ease;
					-moz-transition: opacity 0.5s ease;
					-o-transition: opacity 0.5s ease;
					-ms-transition: opacity 0.5s ease;
					transition: opacity 0.5s ease;
				}
				
				#${this.sWindow.id}.d-visible-${this.chatpage}.${this.mobileClass}{
					opacity: 1;
					top:0;
					bottom:0;
					left: 0;
					right:0;
					margin-left: 0
				}
				
				#${this.sWindow.id}.${this.mobileClass}{
					width: 100%;
					height: 100%;
					bottom: -9999px;
					background-color:#fff;
					border: none;
					border-radius: 0;
					box-shadow:none;
				}
				
				#${this.sWindow.id} a{
					text-decoration:none;
				}
				
				#${this.sWindow.id} #scandi-window-body{
					flex:1;
					display:flex;
					flex-direction: column;
				}
				
				#${this.sWindow.id} #scandi-window-body .scandi-lds-ring {
				    display: inline-block;
				    position: absolute;
				    width: 64px;
				    height: 64px;
				    z-index: 1;
				    top: 50%;
				    left: 50%;
				    margin-top: -64px;
				    margin-left: -32px;
				}
				
				#${this.sWindow.id} #scandi-window-body .scandi-lds-ring div {
				    box-sizing: border-box;
					display: block;
					position: absolute;
					width: 51px;
					height: 51px;
					margin: 6px;
					border: 6px solid #1FB6FF;
					border-radius: 50%;
					animation: scandi-lds-ring 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
					border-color: #1FB6FF transparent transparent transparent;
				}
				
				#${this.sWindow.id} #scandi-window-body .scandi-lds-ring div:nth-child(1) {
					animation-delay: -0.45s;
				}
				
				#${this.sWindow.id} #scandi-window-body .scandi-lds-ring div:nth-child(2) {
					animation-delay: -0.3s;
				}
				
				#${this.sWindow.id} #scandi-window-body .scandi-lds-ring div:nth-child(3) {
					animation-delay: -0.15s;
				}
				
				@keyframes scandi-lds-ring {
					0% {
						transform: rotate(0deg);
					}
					100% {
						transform: rotate(360deg);
					}
				}
				
				
				#${this.sWindow.id} #scandi-window-footer{
				
				}
				
				#${this.sWindow.id} #scandi-window-footer #${this.sWindow.id}-login-promote {
					display:none;
				}
				
				#${this.sWindow.id} #scandi-window-footer #${this.sWindow.id}-login-promote.show {
					display: block;
					overflow: hidden;
					height: 50px;
					line-height: 50px;
					border-top: 1px solid #ececec;
				}
				
				#${this.sWindow.id} #scandi-window-footer #${this.sWindow.id}-login-promote img {
					display: inline-block;
				    width: 36px;
				    height: 36px;
				    border-radius: ${(this.sButton.icon.indexOf('/messages-logo.png') !== -1) ? '0' : '100%'};
				    margin: ${(this.sButton.icon.indexOf('/messages-logo.png') !== -1) ? '6px 10px 0 10px' : '8px 10px 0 10px'};
				    float: left;
				}

				#${this.sWindow.id} #scandi-window-footer #${this.sWindow.id}-login-promote .scandi-chatpage-name {
					display: inline-block;
				    margin: 0;
				    box-sizing: border-box;
				    width: 150px;
				    line-height: 16px;
				    display: inline-block;
				    vertical-align: middle;
				    line-height: normal;
				}
				
				#${this.sWindow.id} #scandi-window-footer #${this.sWindow.id}-login-promote #${this.sWindow.id}-join-now-button {
					display: inline-block;
					float: right;
					background: #7ED321;
				    color: #fff;
				    text-align: center;
				    height: 35px;
				    line-height: 34px;
				    margin: 8px 10px 0 0;
				    padding-left: 30px;
				    padding-right: 30px;
				    border-radius: 3px;
				    font-size: 15px;
				    cursor: pointer;
				    text-decoration: none;
				    -webkit-touch-callout: none;
				    -webkit-user-select: none;
				    -khtml-user-select: none;
				    -moz-user-select: none;
				    -ms-user-select: none;
				    user-select: none;
				}
				
				#${this.sWindow.id} #scandi-window-footer #f-ad{
					width:100%;
					border-top:1px solid #ececec;
				}
				
				#${this.sWindow.id} #scandi-window-footer #f-ad > div{
					margin: 0 auto;
				}`.replace(/(\r\n|\n|\r)/gm, '');

			this.attachStyle(this.CSS);
		}

		/**
		 * Set show hide Scandi window state
		 */
		setWindowState() {
			const urlParams = new URLSearchParams(window.location.search);

			if (urlParams.get('sw') || this.isOrigin) {
				this.showSWindow();
			} else {
				this.hideSWindow();
			}
		}

		/**
		 * Show Scandi window
		 */
		showSWindow(callback) {
			this.addClass(this.sWindow.node, `d-visible-${this.chatpage}`);
			this.removeClass(this.sButton.node, `d-visible-${this.chatpage}`);
			if (!this.iframe.node) {
				this.deleteBroadcastIframe();
				this.clearButtonData();
				this.createIframe(callback);
			} else {
				this.iframe.node.contentWindow.postMessage('scandi-window-open', '*');
				if (this.getType(callback) === '[object Function]') callback();
			}
			this.sWindow.hided = false;
		}

		/**
		 * Hide Scandi window
		 */
		hideSWindow() {
			this.addClass(this.sButton.node, `d-visible-${this.chatpage}`);
			this.removeClass(this.sWindow.node, `d-visible-${this.chatpage}`);
			this.clearButtonData();
			if (this.iframe.node) this.iframe.node.contentWindow.postMessage('scandi-window-close', '*');
			this.sWindow.hided = true;
		}

		/**
		 * Show Scandi window
		 */
		showSWindowRouteNav() {
			if (
				this.iframe.node &&
				this.iframe.node.contentWindow
			) {
				this.iframe.node.contentWindow.postMessage('scandi-show-back-chatpage', '*');
			}
		}

		/**
		 * Hide Scandi window
		 */
		hideSWindowRouteNav() {
			if (
				this.iframe.node &&
				this.iframe.node.contentWindow
			) {
				this.iframe.node.contentWindow.postMessage('scandi-hide-back-chatpage', '*');
			}
		}

		/**
		 * Update Scandi Button Data
		 */
		updateButtonData(data) {
			if (!this.sButton.node && !data.count) return;

			if (this.sWindow.hided) this.clearWRouteHistory();

			this.addBadge(data.count);

			this.sButton.iconNode.src = data.button_icon_url || this.sButton.icon;


			if (data.button_message) {
				this.addClass(this.sButton.coverNode, 'sc-show-button-message');
				this.addClass(this.sButton.node, 'sc-broadcast-button-message');

				this.sButton.coverNode.style.cssText = `color: ${data.button_text_color}; border: ${this.sButton.bBorderWidth}px solid ${data.button_outline_color || '#fff'}`;

				this.sButton.messageNode.innerText = data.button_message;

				if (data.button_position.toLowerCase() === 'right') {
					this.addClass(this.sButton.coverNode, 'sc-float-right');
				} else {
					this.removeClass(this.sButton.coverNode, 'sc-float-right');

				}
			} else {
				this.removeClass(this.sButton.coverNode, 'sc-show-button-message');
				this.removeClass(this.sButton.node, 'sc-broadcast-button-message');
				this.sButton.coverNode.style.cssText = null;
			}
		}

		/**
		 * Clear Scandi Button Data
		 */
		clearButtonData() {
			this.clearBadge();

			this.sButton.iconNode.src = this.sButton.icon;
			this.removeClass(this.sButton.coverNode, 'sc-show-button-message');
			this.removeClass(this.sButton.node, 'sc-broadcast-button-message');
			this.sButton.coverNode.style.cssText = null;
		}

		/**
		 * Add badge Scandi window button
		 */
		addBadge(count) {
			if (this.sButton.badgeCountNode) {
				this.sButton.badgeCountNode.innerText = count;
				this.addClass(this.sButton.node, 'sc-broadcast-badge');
			}
		}

		/**
		 * Clear badge Scandi window
		 */
		clearBadge() {
			this.sButton.badgeCountNode.innerText = 0;
			this.removeClass(this.sButton.node, 'sc-broadcast-badge')
		}

		/**
		 * Add to history
		 */
		addWRouteHistory(name) {
			if (
				this.sWindow.routeHistory.length &&
				this.sWindow.routeHistory[this.sWindow.routeHistory.length - 1] !== name
			) {
				this.sWindow.routeHistory.push(name);
				this.showSWindowRouteNav();
			} else if (
				!this.sWindow.routeHistory.length &&
				this.chatpage !== name
			) {
				this.sWindow.routeHistory.push(this.chatpage);
				this.sWindow.routeHistory.push(name);
				this.showSWindowRouteNav();
			}

			this.routeToPage(name);
		}

		/**
		 * Remove from history
		 */
		backStepWRouteHistory() {
			this.sWindow.routeHistory.pop();
			if (this.sWindow.routeHistory.length) {
				this.routeToPage(this.sWindow.routeHistory[this.sWindow.routeHistory.length - 1]);
				if (this.sWindow.routeHistory.length === 1) {
					this.hideSWindowRouteNav();
					this.sWindow.routeHistory = [];
				}
			} else {
				this.hideSWindowRouteNav();
				this.routeToPage(false);
			}
		}

		/**
		 * Clear history
		 */
		clearWRouteHistory() {
			this.sWindow.routeHistory = [];
			this.routeToPage(false);
			this.hideSWindowRouteNav();
		}

		/**
		 * Open home page
		 */
		routeToPage(name) {
			if (this.iframe.node) {
				this.iframe.node.contentWindow.postMessage(`scandi-route-to:${name || this.chatpage}`, '*');
			}
		}

		/**
		 * Show login form
		 */
		openLoginForm() {
			if (this.iframe.node) {
				this.iframe.node.contentWindow.postMessage(`scandi-login-form`, '*');
			}
		}

		/**
		 * Load QR reader link
		 */
		loadQrReaderLink(url) {
			window.location.replace(url);
		}

		/**
		 * Create Scandi button
		 */
		createSButton() {
			let htmlTemplate = `<div id="${this.sButton.id}">
									<div id="${this.sButton.id}-cover">
										<div class="${this.sButton.id}-icon">
											<img src="${this.sButton.icon}" alt="">
											<span class="sc-badge">${this.sButton.badgeCount}</span>
										</div>
										<div class="${this.sButton.id}-message">
											<span class="sc-button-message"></span>
											<span class="sc-button-message-chatpage">${this.chatpageName}</span>
										</div>
									</div>
								</div>`;

			let template = document.createRange().createContextualFragment(htmlTemplate);
			document.body.appendChild(template);

			this.sButton.node = document.getElementById(this.sButton.id);
			this.sButton.badgeCountNode = document.querySelector(`#${this.sButton.id} .sc-badge`);
			this.sButton.iconNode = document.querySelector(`#${this.sButton.id} img`);
			this.sButton.messageNode = document.querySelector(`#${this.sButton.id} .${this.sButton.id}-message span.sc-button-message`);
			this.sButton.coverNode = document.querySelector(`#${this.sButton.id}-cover`);
		}

		/**
		 * Create Scandi window
		 */
		createSWindow() {
			let htmlTemplate = `<div id="${this.sWindow.id}" class="${this.mobileClass}">
									<div id="scandi-window-body">
										<div class="scandi-lds-ring"><div></div><div></div><div></div><div></div></div>
									</div>
									<div id="scandi-window-footer">
										<!-- class show to show by default --->
										<div id="${this.sWindow.id}-login-promote" class="hide">
											<img src="${this.sButton.icon}" alt="">
											<p class="scandi-chatpage-name">Join <strong>${(this.chatpageName.toLowerCase() !== 'scandi') ? this.chatpageName : ''} </strong>on Scandi</p>
											<span id="${this.sWindow.id}-join-now-button">Join Now</span>
										</div>
									</div>
								</div>`;

			let template = document.createRange().createContextualFragment(htmlTemplate);
			document.body.appendChild(template);

			this.sWindow.node = document.getElementById(this.sWindow.id);

			this.sWindow.joinNowButtonNode = document.getElementById(`${this.sWindow.id}-join-now-button`);
			this.sWindow.loginPromoteNode = document.getElementById(`${this.sWindow.id}-login-promote`);
			this.sWindow.spinnerNode = document.querySelector(`#${this.sWindow.id} #scandi-window-body .scandi-lds-ring`);
			this.sWindow.adContainer = document.getElementById('div-gpt-ad-1566899810998-0');
		}

		/**
		 * Create Iframe
		 */
		createIframe(callback) {
			let iframe = document.createElement('iframe');

			iframe.id = this.iframe.id;
			iframe.frameBorder = this.iframe.frameBorder;
			iframe.allowfullscreen = true;
			iframe.allow = 'camera *;microphone *;';
			iframe.width = this.iframe.width;
			iframe.height = this.iframe.height;
			iframe.src = `${this.iframe.src}&${window.location.search.substr(1)}`;
			document.getElementById('scandi-window-body').appendChild(iframe);

			iframe.addEventListener('load', function () {
				this.deleteIframeLoader();
				if (this.getType(callback) === '[object Function]') callback();
			}.bind(this));

			this.iframe.node = iframe;
		}

		/**
		 * Create Broadcast Iframe
		 */
		createBroadcastIframe() {
			let iframe = document.createElement('iframe');

			iframe.id = `${this.iframe.id}-broadcast`;
			iframe.frameBorder = this.iframe.frameBorder;
			iframe.allowfullscreen = true;
			iframe.width = 0;
			iframe.height = 0;
			iframe.src = this.iframe.srcBroadcast;
			iframe.style = 'display:none!important;';
			document.body.appendChild(iframe);

			this.iframe.broadcastNode = iframe;
		}

		/**
		 * Delete Iframe Loader
		 */
		deleteIframeLoader() {
			this.sWindow.spinnerNode.remove();
		}

		/**
		 * Delete Broadcast Iframe
		 */
		deleteBroadcastIframe() {
			this.iframe.broadcastNode.remove();
		}

		/**
		 * Attach Style
		 * @param text
		 * @returns {HTMLStyleElement}
		 */
		attachStyle(text) {
			let style = document.createElement('style');

			style.type = 'text/css';
			style.rel = 'stylesheet';
			style.media = 'all';

			if (/WebKit|MSIE/i.test(navigator.userAgent)) {
				if (style.styleSheet) {
					style.styleSheet.cssText = text;
				} else {
					style.innerText = text;
				}
			} else {
				style.innerHTML = text;
			}
			document.getElementsByTagName('head')[0].appendChild(style);
			return style;
		}

		/**
		 * Check item class
		 * @param node
		 * @param className
		 * @returns {boolean}
		 */
		hasClass(node, className) {
			if (node) return new RegExp("(?:^|\\s+)" + className + "(?:\\s+|$)").test(node.className);
		};

		/**
		 * Adding a class to element
		 * @param node
		 * @param className
		 * @returns {ScandiWindow}
		 */
		addClass(node, className) {
			if (!this.hasClass(node, className)) {
				if (node) node.className = node.className ? [node.className, className].join(' ') : className;
			}
			return this;
		};

		/**
		 * Removing a class of element
		 * @param node
		 * @param className
		 * @returns {ScandiWindow}
		 */
		removeClass(node, className) {
			if (this.hasClass(node, className)) {
				let reg = new RegExp('(\\s|^)' + className + '(\\s|$)');
				node.className = node.className.replace(reg, ' ')
			}
			return this;
		};

		/**
		 * Get Cookie
		 * @param name
		 * @returns {String}
		 */
		getCookie(name) {
			let matches = document.cookie.match(new RegExp(
				"(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
			));
			return matches ? decodeURIComponent(matches[1]) : undefined;
		}

		/**
		 * Set Cookie
		 * @param name
		 * @param value
		 * @param options
		 */
		setCookie(name, value, options) {
			options = options || {};

			let expires = options.expires;

			if (typeof expires == "number" && expires) {
				let d = new Date();
				d.setTime(d.getTime() + expires * 24 * 60 * 60 * 1000);
				expires = options.expires = d;
			}
			if (expires && expires.toUTCString) {
				options.expires = expires.toUTCString();
			}

			value = encodeURIComponent(value);

			let updatedCookie = name + "=" + value;

			for (let propName in options) {
				updatedCookie += "; " + propName;
				let propValue = options[propName];
				if (propValue !== true) {
					updatedCookie += "=" + propValue;
				}
			}
			document.cookie = updatedCookie;
		}

		/**
		 * Delete Cookie
		 * @param name
		 */
		deleteCookie(name) {
			this.setCookie(name, "", {expires: -1})
		}

		/**
		 * Update Url query string param
		 * @param obj
		 */
		updateQueryStringParameter(obj) {
			let url = window.location.search;

			for (let key in obj) {
				let re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
				let separator = url.indexOf('?') !== -1 ? "&" : "?";
				if (url.match(re)) {
					url = url.replace(re, '$1' + key + "=" + obj[key] + '$2');
				} else {
					url = url + separator + key + "=" + obj[key];
				}
			}

			window.history.pushState('', '', url);
		}

		/**
		 * Remove Url query string param
		 * @param obj
		 * @returns {*}
		 */
		removeURLParameter(obj) {
			let url = window.location.search;

			for (let key in obj) {
				let urlparts = url.split('?');
				if (urlparts.length >= 2) {

					let prefix = encodeURIComponent(key) + '=';
					let pars = urlparts[1].split(/[&;]/g);
					for (let i = pars.length; i-- > 0;) {
						if (pars[i].lastIndexOf(prefix, 0) !== -1) {
							pars.splice(i, 1);
						}
					}
					url = urlparts[0] + (pars.length > 0 ? '?' + pars.join('&') : '');

					url = (url || '?');
				}
			}

			window.history.pushState('', '', url);
		}

		/**
		 * Update Url Path
		 * @param path
		 */
		updateURLpath(path) {
			window.history.pushState({}, null, path)
		}

		/**
		 * Remove Url Path
		 */
		removeURLpath() {
			window.history.pushState({}, null, '/')
		}

		/**
		 * Get type
		 * @param obj
		 * @returns {string}
		 */
		getType(obj) {
			return Object.prototype.toString.call(obj);
		}

		/**
		 * Bind event listener
		 * @param obj
		 * @param eventName
		 * @param handler
		 * @returns {function(*=): *}
		 */
		bind(obj, eventName, handler) {
			let handlerWrapper = function (event) {
				event = event || window.event;
				if (!event.target && event.srcElement) {
					event.target = event.srcElement;
				}
				return handler.call(obj, event);
			};

			if (obj.addEventListener) {
				obj.addEventListener(eventName, handlerWrapper, false);
			} else if (obj.attachEvent) {
				obj.attachEvent('on' + eventName, handlerWrapper);
			}
			return handlerWrapper;
		}

		/**
		 * Unbind event listener
		 * @param obj
		 * @param eventName
		 * @param handler;(function (w) {
	/**
	 * ScandiWindow
	 */
		class ScandiWindow {
		constructor(data) {
			this.chatpage = (data.chatpage || 'go').toString().toLowerCase().replace(/^\s+|\s+$/g, '');
			this.chatpage = this.chatpage.replace(/\s+/g, '_');
			this.path = data.path || '';

			this.chatpageName = '';

			try {
				this.origin = data.origin || ORIGIN;
			} catch (err) {
				this.origin = 'https://w.dev-scandi.com/';
			}

			this.isOrigin = (
				(window.location.hostname !== 'localhost') &&
				(this.origin.indexOf(window.location.hostname.replace(location.hostname.split('.').shift(), '')) !== -1) &&
				location.href !== this.origin.replace('w.', '')
			);

			this.sButton = {
				id: `scandi-button-${this.chatpage}`,
				icon: (data.button && data.button.icon) || `${this.origin}images/messages-logo.png`,
				width: (data.button && data.button.width) || 65,
				height: (data.button && data.button.height) || 65,
				bottom: (data.button && data.button.bottom) || 50,
				right: (data.button && data.button.right && !data.button.left) ? data.button.right : (!data.button ? 50 : 'auto'),
				left: (data.button && data.button.left) || 'auto',
				mBottom: (data.button && data.button.mobileBottom) || 20,
				mRight: (data.button && data.button.mobileRight && !data.button.mobileLeft) ? data.button.mobileRight : (!data.button ? 20 : 'auto'),
				mLeft: (data.button && data.button.mobileLeft) || 'auto',
				bPadding: 10,
				bBorderWidth: 1,
				bPageNameHeight: 15,
				badgeCount: 0,
				node: null,
				badgeCountNode: null,
				iconNode: null,
				messageNode: null,
				coverNode: null

			};

			this.sWindow = {
				id: `scandi-window-${this.chatpage}`,
				width: (data.window && data.window.width) || 370,
				height: (data.window && data.window.height) || 650,
				bottom: (data.window && data.window.bottom) || 0,
				top: (data.window && data.window.top) || 'auto',
				right: (data.window && data.window.right && !data.window.left) ? data.window.right : (!data.window ? 50 : 'auto'),
				left: (data.window && data.window.left) || 'auto',
				triggerLinkCallback: null,
				hided: true,
				routeHistory: [],
				node: null,
				joinNowButtonNode: null,
				loginPromoteNode: null,
				spinnerNode: null,
				poweredByNode: null
			};

			this.iframe = {
				id: `scandi-${this.chatpage}`,
				frameBorder: 0,
				width: '100%',
				height: '100%',
				src: `${this.origin}${this.chatpage}${this.path}?chatpage=${this.chatpage}&origin=${this.isOrigin}`,
				srcBroadcast: `${this.origin}${this.chatpage}/broadcast?chatpage=${this.chatpage}`,
				node: null
			};

			this.firstTimeLoad = false;

			this.mobileClass = (
				(/android|webos|iphone|blackberry|iemobile|opera mini/i.test(navigator.userAgent.toLowerCase())) ||
				(window.innerWidth <= 600 && window.innerHeight <= 900)
			) ? 'mobile' : '';
			this.isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);


			this.init();
		}

		/**
		 * Set Styles
		 */
		setupStyles() {
			this.CSS = `
				#${this.sButton.id}.d-visible-${this.chatpage}{
					display:inline-block;
				}
			
				#${this.sButton.id}{
					display:none;
					position:fixed;
					bottom: ${this.sButton.bottom}px;
					right: ${(this.sButton.right !== 'auto') ? this.sButton.right + 'px' : this.sButton.right};
					left: ${(this.sButton.left !== 'auto') ? this.sButton.left + 'px' : this.sButton.left};
					z-index:999999;
					cursor:pointer;
				}
				
				#${this.sButton.id}.sc-broadcast-button-message {
					bottom: ${Number(this.sButton.bottom) - this.sButton.bPadding - this.sButton.bBorderWidth}px;
					right: ${(this.sButton.right !== 'auto') ? (Number(this.sButton.right) - this.sButton.bPadding - this.sButton.bBorderWidth) + 'px' : this.sButton.right};
					left: ${(this.sButton.left !== 'auto') ? (Number(this.sButton.left) - this.sButton.bPadding - this.sButton.bBorderWidth) + 'px' : this.sButton.left};
				}
				
				#${this.sButton.id} #${this.sButton.id}-cover:after {
				    display: block;
				    clear: both;
					content: "";
				} 
				
				#${this.sButton.id} .${this.sButton.id}-icon {
					position: relative;
					float: left;
				}
				
				#${this.sButton.id} .${this.sButton.id}-message {
					width: calc(100% - ${this.sButton.height + this.sButton.bPadding}px);
					display: none;
					position: relative;
					float: left;
					font-family:sans-serif;
					font-size:15px;
					font-weight: bold;
					padding-left: ${this.sButton.bPadding}px;
					height: ${this.sButton.height - this.sButton.bPageNameHeight}px;
					line-height: ${this.sButton.height - this.sButton.bPageNameHeight - 3}px;
				}
						
				#${this.sButton.id} .${this.sButton.id}-message span.sc-button-message {
					display: inline-block;
					vertical-align: middle;
					line-height: normal;
				}
				
				#${this.sButton.id} .${this.sButton.id}-message span.sc-button-message-chatpage {
					display: inline-block;
					position: absolute;
					left: ${this.sButton.bPadding}px;
					bottom: -${this.sButton.bPageNameHeight}px;
					font-size: 12px;
                    color: #9B9B9B;
                    font-family:sans-serif;
                    font-weight:normal;
                    line-height: ${this.sButton.bPageNameHeight}px;
                    height: ${this.sButton.bPageNameHeight}px;
				}
				
				#${this.sButton.id} .${this.sButton.id}-message span.sc-button-m {
					display: inline-block;
					vertical-align: middle;
					line-height: normal;
				}
				
				#${this.sButton.id} #${this.sButton.id}-cover.sc-show-button-message {
					max-width: 320px;
					min-width: 270px;
					padding: ${this.sButton.bPadding}px;
					background: #ffffff;
					box-shadow: 3px 3px 4px 0 rgba(219,219,219,0.5);
					border-top-left-radius: ${(this.sButton.height / 2) + this.sButton.bPadding + (this.sButton.bBorderWidth * 2)}px;
                    border-bottom-left-radius: ${(this.sButton.height / 2) + this.sButton.bPadding + (this.sButton.bBorderWidth * 2)}px;
				}
				
				#${this.sButton.id} #${this.sButton.id}-cover.sc-show-button-message.sc-float-right {
					border-top-left-radius: 0;
                    border-bottom-left-radius: 0;
                    border-top-right-radius: ${(this.sButton.height / 2) + this.sButton.bPadding + (this.sButton.bBorderWidth * 2)}px;
                    border-bottom-right-radius: ${(this.sButton.height / 2) + this.sButton.bPadding + (this.sButton.bBorderWidth * 2)}px;
				}
				
				#${this.sButton.id} #${this.sButton.id}-cover.sc-show-button-message.sc-float-right .${this.sButton.id}-icon .sc-badge{
				    right: auto;
				    left: -5px;
				}
				
				#${this.sButton.id} #${this.sButton.id}-cover.sc-show-button-message.sc-float-right .${this.sButton.id}-message {
					padding-left: 0;
					padding-right: ${this.sButton.bPadding}px;
					text-align: right;
				}
				
				#${this.sButton.id} #${this.sButton.id}-cover.sc-show-button-message.sc-float-right .${this.sButton.id}-message span.sc-button-message-chatpage {
					left: auto;
					right: ${this.sButton.bPadding}px;
				}
				
				#${this.sButton.id} #${this.sButton.id}-cover.sc-show-button-message .${this.sButton.id}-message {
					display: block;	
				}
				
				#${this.sButton.id} #${this.sButton.id}-cover.sc-show-button-message img {
					box-shadow: none;
					position: relative;
					top: ${(this.sButton.icon.indexOf('/messages-logo.png') !== -1) ? '-1px' : 'auto'};
				}
				
				
				#${this.sButton.id} #${this.sButton.id}-cover.sc-float-right .${this.sButton.id}-icon,
				#${this.sButton.id} #${this.sButton.id}-cover.sc-float-right .${this.sButton.id}-message {
				    float: right;
				} 
				
				#${this.sButton.id} .${this.sButton.id}-icon .sc-badge{
					display: none;
					position: absolute;
				    width: 27px;
				    height: 27px;
				    border-radius: 100%;
				    background: #FF0000;
				    top: -8px;
				    right: -5px;
				    box-shadow: 0 0 2px 1px rgba(0,0,0,0.2);
				    border: 1px solid #fff;
				    font-size: 14px;
				    color: #fff;
				    text-align: center;
				    line-height: 27px;
				}
				
				#${this.sButton.id}.sc-broadcast-badge .${this.sButton.id}-icon .sc-badge{
					display: inline-block;
				}
				
				@media (max-width: 900px) {
					#${this.sButton.id}{
						bottom: ${this.sButton.mBottom}px;
						right: ${(this.sButton.mRight !== 'auto') ? this.sButton.mRight + 'px' : this.sButton.mRight};
						left: ${(this.sButton.mLeft !== 'auto') ? this.sButton.mLeft + 'px' : this.sButton.mLeft};
					}
					
					#${this.sButton.id}.sc-broadcast-button-message {
						bottom: ${this.sButton.mBottom - this.sButton.bPadding - this.sButton.bBorderWidth}px;
						right: ${((this.sButton.mRight !== 'auto') ? this.sButton.mRight : this.sButton.mLeft) - (this.sButton.bPadding - this.sButton.bBorderWidth)}px;
						left: ${((this.sButton.mLeftt !== 'auto') ? this.sButton.mLeft : this.sButton.mRight) - (this.sButton.bPadding - this.sButton.bBorderWidth)}px;
					}
				}
				
				#${this.sButton.id} img{
					display:inline-block;
					width: ${this.sButton.width}px;
					height: ${(this.sButton.icon.indexOf('/messages-logo.png') !== -1) ? 'auto' : `${this.sButton.height}px`};
					border-radius: ${(this.sButton.icon.indexOf('/messages-logo.png') !== -1) ? 'none' : '100%'};
					box-shadow: ${(this.sButton.icon.indexOf('/messages-logo.png') !== -1) ? 'none' : '0 1px 3px 1px rgba(0, 0, 0, 0.4)'};
				}
				
				#${this.sWindow.id}.d-visible-${this.chatpage}{
					opacity: 1;
					bottom: ${this.sWindow.bottom}px;
					top: ${(this.sWindow.top !== 'auto') ? this.sWindow.top + 'px' : this.sWindow.top};
				}
				
				#${this.sWindow.id}{
					opacity: 0;
					display: flex;
					flex-direction: column;
					position:fixed;
					bottom: -9999px;
					width: ${this.sWindow.width}px;
					height: ${(this.sWindow.height !== 'auto') ? this.sWindow.height + 'px' : this.sWindow.height};
					right: ${(this.sWindow.right !== 'auto') ? this.sWindow.right + 'px' : this.sWindow.right};
					left: ${(this.sWindow.left !== 'auto') ? (this.isOrigin ? (this.sWindow.left + '%') : (this.sWindow.left + 'px')) : this.sWindow.left};
					margin-left: ${(this.isOrigin) ? '-' + this.sWindow.width / 2 : 0}px;
					z-index:999999;
					overflow:hidden;
					font-family:sans-serif;
					font-size:14px;
					background-color:#fff;
					border:1px solid #D8D8D8;
					border-top-left-radius:10px;
					border-top-right-radius:10px;
					box-shadow:0 0 3px 2px rgba(0,0,0,0.1);
					-webkit-overflow-scrolling: touch;
					
					-webkit-transition: opacity 0.5s ease;
					-moz-transition: opacity 0.5s ease;
					-o-transition: opacity 0.5s ease;
					-ms-transition: opacity 0.5s ease;
					transition: opacity 0.5s ease;
				}
				
				#${this.sWindow.id}.d-visible-${this.chatpage}.${this.mobileClass}{
					opacity: 1;
					top:0;
					bottom:0;
					left: 0;
					right:0;
					margin-left: 0
				}
				
				#${this.sWindow.id}.${this.mobileClass}{
					width: 100%;
					height: 100%;
					bottom: -9999px;
					background-color:#fff;
					border: none;
					border-radius: 0;
					box-shadow:none;
				}
				
				#${this.sWindow.id} a{
					text-decoration:none;
				}
				
				#${this.sWindow.id} #scandi-window-body{
					flex:1;
					display:flex;
					flex-direction: column;
				}
				
				#${this.sWindow.id} #scandi-window-body .scandi-lds-ring {
				    display: inline-block;
				    position: absolute;
				    width: 64px;
				    height: 64px;
				    z-index: 1;
				    top: 50%;
				    left: 50%;
				    margin-top: -64px;
				    margin-left: -32px;
				}
				
				#${this.sWindow.id} #scandi-window-body .scandi-lds-ring div {
				    box-sizing: border-box;
					display: block;
					position: absolute;
					width: 51px;
					height: 51px;
					margin: 6px;
					border: 6px solid #1FB6FF;
					border-radius: 50%;
					animation: scandi-lds-ring 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
					border-color: #1FB6FF transparent transparent transparent;
				}
				
				#${this.sWindow.id} #scandi-window-body .scandi-lds-ring div:nth-child(1) {
					animation-delay: -0.45s;
				}
				
				#${this.sWindow.id} #scandi-window-body .scandi-lds-ring div:nth-child(2) {
					animation-delay: -0.3s;
				}
				
				#${this.sWindow.id} #scandi-window-body .scandi-lds-ring div:nth-child(3) {
					animation-delay: -0.15s;
				}
				
				@keyframes scandi-lds-ring {
					0% {
						transform: rotate(0deg);
					}
					100% {
						transform: rotate(360deg);
					}
				}
				
				
				#${this.sWindow.id} #scandi-window-footer{
				
				}
				
				#${this.sWindow.id} #scandi-window-footer #${this.sWindow.id}-login-promote {
					display:none;
				}
				
				#${this.sWindow.id} #scandi-window-footer #${this.sWindow.id}-login-promote.show {
					display: block;
					overflow: hidden;
					height: 50px;
					line-height: 50px;
					border-top: 1px solid #ececec;
				}
				
				#${this.sWindow.id} #scandi-window-footer #${this.sWindow.id}-login-promote img {
					display: inline-block;
				    width: 36px;
				    height: 36px;
				    border-radius: ${(this.sButton.icon.indexOf('/messages-logo.png') !== -1) ? '0' : '100%'};
				    margin: ${(this.sButton.icon.indexOf('/messages-logo.png') !== -1) ? '6px 10px 0 10px' : '8px 10px 0 10px'};
				    float: left;
				}

				#${this.sWindow.id} #scandi-window-footer #${this.sWindow.id}-login-promote .scandi-chatpage-name {
					display: inline-block;
				    margin: 0;
				    box-sizing: border-box;
				    width: 150px;
				    line-height: 16px;
				    display: inline-block;
				    vertical-align: middle;
				    line-height: normal;
				}
				
				#${this.sWindow.id} #scandi-window-footer #${this.sWindow.id}-login-promote #${this.sWindow.id}-join-now-button {
					display: inline-block;
					float: right;
					background: #7ED321;
				    color: #fff;
				    text-align: center;
				    height: 35px;
				    line-height: 34px;
				    margin: 8px 10px 0 0;
				    padding-left: 30px;
				    padding-right: 30px;
				    border-radius: 3px;
				    font-size: 15px;
				    cursor: pointer;
				    text-decoration: none;
				    -webkit-touch-callout: none;
				    -webkit-user-select: none;
				    -khtml-user-select: none;
				    -moz-user-select: none;
				    -ms-user-select: none;
				    user-select: none;
				}
				
				#${this.sWindow.id} #scandi-window-footer #f-ad{
					width:100%;
					border-top:1px solid #ececec;
				}
				
				#${this.sWindow.id} #scandi-window-footer #f-ad > div{
					margin: 0 auto;
				}`.replace(/(\r\n|\n|\r)/gm, '');

			this.attachStyle(this.CSS);
		}

		/**
		 * Set show hide Scandi window state
		 */
		setWindowState() {
			const urlParams = new URLSearchParams(window.location.search);

			if (urlParams.get('sw') || this.isOrigin) {
				this.showSWindow();
			} else {
				this.hideSWindow();
			}
		}

		/**
		 * Show Scandi window
		 */
		showSWindow(callback) {
			this.addClass(this.sWindow.node, `d-visible-${this.chatpage}`);
			this.removeClass(this.sButton.node, `d-visible-${this.chatpage}`);
			if (!this.iframe.node) {
				this.deleteBroadcastIframe();
				this.clearButtonData();
				this.createIframe(callback);
			} else {
				this.iframe.node.contentWindow.postMessage('scandi-window-open', '*');
				if (this.getType(callback) === '[object Function]') callback();
			}
			this.sWindow.hided = false;
		}

		/**
		 * Hide Scandi window
		 */
		hideSWindow() {
			this.addClass(this.sButton.node, `d-visible-${this.chatpage}`);
			this.removeClass(this.sWindow.node, `d-visible-${this.chatpage}`);
			this.clearButtonData();
			if (this.iframe.node) this.iframe.node.contentWindow.postMessage('scandi-window-close', '*');
			this.sWindow.hided = true;
		}

		/**
		 * Show Scandi window
		 */
		showSWindowRouteNav() {
			if (
				this.iframe.node &&
				this.iframe.node.contentWindow
			) {
				this.iframe.node.contentWindow.postMessage('scandi-show-back-chatpage', '*');
			}
		}

		/**
		 * Hide Scandi window
		 */
		hideSWindowRouteNav() {
			if (
				this.iframe.node &&
				this.iframe.node.contentWindow
			) {
				this.iframe.node.contentWindow.postMessage('scandi-hide-back-chatpage', '*');
			}
		}

		/**
		 * Update Scandi Button Data
		 */
		updateButtonData(data) {
			if (!this.sButton.node && !data.count) return;

			if (this.sWindow.hided) this.clearWRouteHistory();

			this.addBadge(data.count);

			this.sButton.iconNode.src = data.button_icon_url || this.sButton.icon;


			if (data.button_message) {
				this.addClass(this.sButton.coverNode, 'sc-show-button-message');
				this.addClass(this.sButton.node, 'sc-broadcast-button-message');

				this.sButton.coverNode.style.cssText = `color: ${data.button_text_color}; border: ${this.sButton.bBorderWidth}px solid ${data.button_outline_color || '#fff'}`;

				this.sButton.messageNode.innerText = data.button_message;

				if (data.button_position.toLowerCase() === 'right') {
					this.addClass(this.sButton.coverNode, 'sc-float-right');
				} else {
					this.removeClass(this.sButton.coverNode, 'sc-float-right');

				}
			} else {
				this.removeClass(this.sButton.coverNode, 'sc-show-button-message');
				this.removeClass(this.sButton.node, 'sc-broadcast-button-message');
				this.sButton.coverNode.style.cssText = null;
			}
		}

		/**
		 * Clear Scandi Button Data
		 */
		clearButtonData() {
			this.clearBadge();

			this.sButton.iconNode.src = this.sButton.icon;
			this.removeClass(this.sButton.coverNode, 'sc-show-button-message');
			this.removeClass(this.sButton.node, 'sc-broadcast-button-message');
			this.sButton.coverNode.style.cssText = null;
		}

		/**
		 * Add badge Scandi window button
		 */
		addBadge(count) {
			if (this.sButton.badgeCountNode) {
				this.sButton.badgeCountNode.innerText = count;
				this.addClass(this.sButton.node, 'sc-broadcast-badge');
			}
		}

		/**
		 * Clear badge Scandi window
		 */
		clearBadge() {
			this.sButton.badgeCountNode.innerText = 0;
			this.removeClass(this.sButton.node, 'sc-broadcast-badge')
		}

		/**
		 * Add to history
		 */
		addWRouteHistory(name) {
			if (
				this.sWindow.routeHistory.length &&
				this.sWindow.routeHistory[this.sWindow.routeHistory.length - 1] !== name
			) {
				this.sWindow.routeHistory.push(name);
				this.showSWindowRouteNav();
			} else if (
				!this.sWindow.routeHistory.length &&
				this.chatpage !== name
			) {
				this.sWindow.routeHistory.push(this.chatpage);
				this.sWindow.routeHistory.push(name);
				this.showSWindowRouteNav();
			}

			this.routeToPage(name);
		}

		/**
		 * Remove from history
		 */
		backStepWRouteHistory() {
			this.sWindow.routeHistory.pop();
			if (this.sWindow.routeHistory.length) {
				this.routeToPage(this.sWindow.routeHistory[this.sWindow.routeHistory.length - 1]);
				if (this.sWindow.routeHistory.length === 1) {
					this.hideSWindowRouteNav();
					this.sWindow.routeHistory = [];
				}
			} else {
				this.hideSWindowRouteNav();
				this.routeToPage(false);
			}
		}

		/**
		 * Clear history
		 */
		clearWRouteHistory() {
			this.sWindow.routeHistory = [];
			this.routeToPage(false);
			this.hideSWindowRouteNav();
		}

		/**
		 * Open home page
		 */
		routeToPage(name) {
			if (this.iframe.node) {
				this.iframe.node.contentWindow.postMessage(`scandi-route-to:${name || this.chatpage}`, '*');
			}
		}

		/**
		 * Show login form
		 */
		openLoginForm() {
			if (this.iframe.node) {
				this.iframe.node.contentWindow.postMessage(`scandi-login-form`, '*');
			}
		}

		/**
		 * Load QR reader link
		 */
		loadQrReaderLink(url) {
			window.location.replace(url);
		}

		/**
		 * Create Scandi button
		 */
		createSButton() {
			let htmlTemplate = `<div id="${this.sButton.id}">
									<div id="${this.sButton.id}-cover">
										<div class="${this.sButton.id}-icon">
											<img src="${this.sButton.icon}" alt="">
											<span class="sc-badge">${this.sButton.badgeCount}</span>
										</div>
										<div class="${this.sButton.id}-message">
											<span class="sc-button-message"></span>
											<span class="sc-button-message-chatpage">${this.chatpageName}</span>
										</div>
									</div>
								</div>`;

			let template = document.createRange().createContextualFragment(htmlTemplate);
			document.body.appendChild(template);

			this.sButton.node = document.getElementById(this.sButton.id);
			this.sButton.badgeCountNode = document.querySelector(`#${this.sButton.id} .sc-badge`);
			this.sButton.iconNode = document.querySelector(`#${this.sButton.id} img`);
			this.sButton.messageNode = document.querySelector(`#${this.sButton.id} .${this.sButton.id}-message span.sc-button-message`);
			this.sButton.coverNode = document.querySelector(`#${this.sButton.id}-cover`);
		}

		/**
		 * Create Scandi window
		 */
		createSWindow() {
			let htmlTemplate = `<div id="${this.sWindow.id}" class="${this.mobileClass}">
									<div id="scandi-window-body">
										<div class="scandi-lds-ring"><div></div><div></div><div></div><div></div></div>
									</div>
									<div id="scandi-window-footer">
										<!-- class show to show by default --->
										<div id="${this.sWindow.id}-login-promote" class="hide">
											<img src="${this.sButton.icon}" alt="">
											<p class="scandi-chatpage-name">Join <strong>${(this.chatpageName.toLowerCase() !== 'scandi') ? this.chatpageName : ''} </strong>on Scandi</p>
											<span id="${this.sWindow.id}-join-now-button">Join Now</span>
										</div>
									</div>
								</div>`;

			let template = document.createRange().createContextualFragment(htmlTemplate);
			document.body.appendChild(template);

			this.sWindow.node = document.getElementById(this.sWindow.id);

			this.sWindow.joinNowButtonNode = document.getElementById(`${this.sWindow.id}-join-now-button`);
			this.sWindow.loginPromoteNode = document.getElementById(`${this.sWindow.id}-login-promote`);
			this.sWindow.spinnerNode = document.querySelector(`#${this.sWindow.id} #scandi-window-body .scandi-lds-ring`);
			this.sWindow.adContainer = document.getElementById('div-gpt-ad-1566899810998-0');
		}

		/**
		 * Create Iframe
		 */
		createIframe(callback) {
			let iframe = document.createElement('iframe');

			iframe.id = this.iframe.id;
			iframe.frameBorder = this.iframe.frameBorder;
			iframe.allowfullscreen = true;
			iframe.allow = 'camera *;microphone *;';
			iframe.width = this.iframe.width;
			iframe.height = this.iframe.height;
			iframe.src = `${this.iframe.src}&${window.location.search.substr(1)}`;
			document.getElementById('scandi-window-body').appendChild(iframe);

			iframe.addEventListener('load', function () {
				this.deleteIframeLoader();
				if (this.getType(callback) === '[object Function]') callback();
			}.bind(this));

			this.iframe.node = iframe;
		}

		/**
		 * Create Broadcast Iframe
		 */
		createBroadcastIframe() {
			let iframe = document.createElement('iframe');

			iframe.id = `${this.iframe.id}-broadcast`;
			iframe.frameBorder = this.iframe.frameBorder;
			iframe.allowfullscreen = true;
			iframe.width = 0;
			iframe.height = 0;
			iframe.src = this.iframe.srcBroadcast;
			iframe.style = 'display:none!important;';
			document.body.appendChild(iframe);

			this.iframe.broadcastNode = iframe;
		}

		/**
		 * Delete Iframe Loader
		 */
		deleteIframeLoader() {
			this.sWindow.spinnerNode.remove();
		}

		/**
		 * Delete Broadcast Iframe
		 */
		deleteBroadcastIframe() {
			this.iframe.broadcastNode.remove();
		}

		/**
		 * Attach Style
		 * @param text
		 * @returns {HTMLStyleElement}
		 */
		attachStyle(text) {
			let style = document.createElement('style');

			style.type = 'text/css';
			style.rel = 'stylesheet';
			style.media = 'all';

			if (/WebKit|MSIE/i.test(navigator.userAgent)) {
				if (style.styleSheet) {
					style.styleSheet.cssText = text;
				} else {
					style.innerText = text;
				}
			} else {
				style.innerHTML = text;
			}
			document.getElementsByTagName('head')[0].appendChild(style);
			return style;
		}

		/**
		 * Check item class
		 * @param node
		 * @param className
		 * @returns {boolean}
		 */
		hasClass(node, className) {
			if (node) return new RegExp("(?:^|\\s+)" + className + "(?:\\s+|$)").test(node.className);
		};

		/**
		 * Adding a class to element
		 * @param node
		 * @param className
		 * @returns {ScandiWindow}
		 */
		addClass(node, className) {
			if (!this.hasClass(node, className)) {
				if (node) node.className = node.className ? [node.className, className].join(' ') : className;
			}
			return this;
		};

		/**
		 * Removing a class of element
		 * @param node
		 * @param className
		 * @returns {ScandiWindow}
		 */
		removeClass(node, className) {
			if (this.hasClass(node, className)) {
				let reg = new RegExp('(\\s|^)' + className + '(\\s|$)');
				node.className = node.className.replace(reg, ' ')
			}
			return this;
		};

		/**
		 * Get Cookie
		 * @param name
		 * @returns {String}
		 */
		getCookie(name) {
			let matches = document.cookie.match(new RegExp(
				"(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
			));
			return matches ? decodeURIComponent(matches[1]) : undefined;
		}

		/**
		 * Set Cookie
		 * @param name
		 * @param value
		 * @param options
		 */
		setCookie(name, value, options) {
			options = options || {};

			let expires = options.expires;

			if (typeof expires == "number" && expires) {
				let d = new Date();
				d.setTime(d.getTime() + expires * 24 * 60 * 60 * 1000);
				expires = options.expires = d;
			}
			if (expires && expires.toUTCString) {
				options.expires = expires.toUTCString();
			}

			value = encodeURIComponent(value);

			let updatedCookie = name + "=" + value;

			for (let propName in options) {
				updatedCookie += "; " + propName;
				let propValue = options[propName];
				if (propValue !== true) {
					updatedCookie += "=" + propValue;
				}
			}
			document.cookie = updatedCookie;
		}

		/**
		 * Delete Cookie
		 * @param name
		 */
		deleteCookie(name) {
			this.setCookie(name, "", {expires: -1})
		}

		/**
		 * Update Url query string param
		 * @param obj
		 */
		updateQueryStringParameter(obj) {
			let url = window.location.search;

			for (let key in obj) {
				let re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
				let separator = url.indexOf('?') !== -1 ? "&" : "?";
				if (url.match(re)) {
					url = url.replace(re, '$1' + key + "=" + obj[key] + '$2');
				} else {
					url = url + separator + key + "=" + obj[key];
				}
			}

			window.history.pushState('', '', url);
		}

		/**
		 * Remove Url query string param
		 * @param obj
		 * @returns {*}
		 */
		removeURLParameter(obj) {
			let url = window.location.search;

			for (let key in obj) {
				let urlparts = url.split('?');
				if (urlparts.length >= 2) {

					let prefix = encodeURIComponent(key) + '=';
					let pars = urlparts[1].split(/[&;]/g);
					for (let i = pars.length; i-- > 0;) {
						if (pars[i].lastIndexOf(prefix, 0) !== -1) {
							pars.splice(i, 1);
						}
					}
					url = urlparts[0] + (pars.length > 0 ? '?' + pars.join('&') : '');

					url = (url || '?');
				}
			}

			window.history.pushState('', '', url);
		}

		/**
		 * Update Url Path
		 * @param path
		 */
		updateURLpath(path) {
			window.history.pushState({}, null, path)
		}

		/**
		 * Remove Url Path
		 */
		removeURLpath() {
			window.history.pushState({}, null, '/')
		}

		/**
		 * Get type
		 * @param obj
		 * @returns {string}
		 */
		getType(obj) {
			return Object.prototype.toString.call(obj);
		}

		/**
		 * Bind event listener
		 * @param obj
		 * @param eventName
		 * @param handler
		 * @returns {function(*=): *}
		 */
		bind(obj, eventName, handler) {
			let handlerWrapper = function (event) {
				event = event || window.event;
				if (!event.target && event.srcElement) {
					event.target = event.srcElement;
				}
				return handler.call(obj, event);
			};

			if (obj.addEventListener) {
				obj.addEventListener(eventName, handlerWrapper, false);
			} else if (obj.attachEvent) {
				obj.attachEvent('on' + eventName, handlerWrapper);
			}
			return handlerWrapper;
		}

		/**
		 * Unbind event listener
		 * @param obj
		 * @param eventName
		 * @param handler
		 */
		unbind(obj, eventName, handler) {
			if (obj.removeEventListener) {
				obj.removeEventListener(eventName, handler, false);
			} else {
				obj.detachEvent('on' + eventName, handler);
			}
		}

		/**
		 * Wait for condition
		 * @param condition
		 * @param callback
		 * @param timeout
		 * @param interval
		 * @param onFail
		 * @returns {{_timeout: null, stop: stop}|*}
		 */
		waitFor(condition, callback, timeout, interval, onFail) {
			let control;


			control = {
				_timeout: null,
				stop: function () {
					clearTimeout(this._timeout);
					if (onFail) {
						onFail();
					}
				}
			};
			interval = interval || 50;
			(function waiter() {
				let conditionResult;

				if (conditionResult) {
					callback();
				} else {
					control._timeout = setTimeout(waiter, interval);
				}
			}());

			if (timeout) {
				setTimeout(function () {
					control.stop();
				}, timeout);
			}

			return control;
		}

		/**
		 * Init events
		 */
		initEventListeners() {
			this.bind(this.sButton.node, 'click', this.showSWindow.bind(this));
			this.bind(this.sButton.node, 'touchstart', this.showSWindow.bind(this));

			this.bind(this.sWindow.joinNowButtonNode, 'click', this.openLoginForm.bind(this));
			this.bind(this.sWindow.joinNowButtonNode, 'touchstart', this.openLoginForm.bind(this));
		}

		/**
		 * Init window
		 */
		init() {
			this.setupStyles();
			this.initEventListeners();
			this.createBroadcastIframe();
		}
	}

	w.ScandiWindow = ScandiWindow;
})(window);
		 */
		unbind(obj, eventName, handler) {
			if (obj.removeEventListener) {
				obj.removeEventListener(eventName, handler, false);
			} else {
				obj.detachEvent('on' + eventName, handler);
			}
		}

		/**
		 * Wait for condition
		 * @param condition
		 * @param callback
		 * @param timeout
		 * @param interval
		 * @param onFail
		 * @returns {{_timeout: null, stop: stop}|*}
		 */
		waitFor(condition, callback, timeout, interval, onFail) {
			let control;


			control = {
				_timeout: null,
				stop: function () {
					clearTimeout(this._timeout);
					if (onFail) {
						onFail();
					}
				}
			};
			interval = interval || 50;
			(function waiter() {
				let conditionResult;

				if (conditionResult) {
					callback();
				} else {
					control._timeout = setTimeout(waiter, interval);
				}
			}());

			if (timeout) {
				setTimeout(function () {
					control.stop();
				}, timeout);
			}

			return control;
		}

		/**
		 * Init events
		 */
		initEventListeners() {
			this.bind(this.sButton.node, 'click', this.showSWindow.bind(this));
			this.bind(this.sButton.node, 'touchstart', this.showSWindow.bind(this));

			this.bind(this.sWindow.joinNowButtonNode, 'click', this.openLoginForm.bind(this));
			this.bind(this.sWindow.joinNowButtonNode, 'touchstart', this.openLoginForm.bind(this));
		}

		/**
		 * Init window
		 */
		init() {
			this.setupStyles();
			this.initEventListeners();
			this.createBroadcastIframe();
		}
	}

	w.ScandiWindow = ScandiWindow;
})(window);