import React, { Component } from 'react'
import { Route } from 'react-router-dom'

import CounterPartySelection from '../CounterPartySelection'
import AssetSelection from '../AssetSelection'
import SwapInitiation from '../SwapInitiation'
import CounterPartyLinkCard from '../../components/CounterPartyLinkCard/CounterPartyLinkCard'
import BackupLinkCard from '../../components/BackupLinkCard/BackupLinkCard'
import WalletConnectPopup from '../../components/WalletConnectPopup/WalletConnectPopup'
import ErrorModal from '../../components/ErrorModal/ErrorModal'
import Waiting from '../Waiting'
import WalletPopups from '../WalletPopups'
import SwapRedemption from '../SwapRedemption'
import SwapCompleted from '../SwapCompleted'
import SwapRefund from '../SwapRefund'
import SwapRefunded from '../SwapRefunded'
import SwapOfferSelection from '../SwapOfferSelection'
import SwapOfferConfirmation from '../SwapOfferConfirmation'
import SwapProgressStepper from '../../components/SwapProgressStepper/SwapProgressStepper'
import { generateLink } from '../../utils/app-links'
import config from '../../config'

import { steps } from '../../components/SwapProgressStepper/steps'
import LiqualityLogo from '../../logo-text.png'
import Spinner from './spinner.svg'
import './LiqualitySwap.css'

class LiqualitySwap extends Component {
  constructor (props) {
    super(props)

    this.getCounterPartyLinkCard = this.getCounterPartyLinkCard.bind(this)
    this.getBackupLinkCard = this.getBackupLinkCard.bind(this)
    this.getConnectWallet = this.getConnectWallet.bind(this)
  }

  getStartingScreen () {
    if (this.props.swap.link) {
      return <SwapInitiation />
    } else {
      if (config.hostAgent) {
        return <CounterPartySelection />
      } else {
        return <AssetSelection />
      }
    }
  }

  getBackupLinkCard () {
    const link = this.props.swap.link
    const skipCounterParty = this.props.swap.isPartyB || this.props.swap.agent.quote
    return <BackupLinkCard link={link} onNextClick={() => this.props.history.replace(skipCounterParty ? '/waiting' : '/counterPartyLink')} />
  }

  getCounterPartyLinkCard () {
    const link = generateLink(this.props.swap, true)
    return <CounterPartyLinkCard link={link} onNextClick={() => { this.props.history.replace('/waiting') }} />
  }

  getConnectWallet (currentWallet) {
    const walletA = this.props.swap.wallets.a
    const walletB = this.props.swap.wallets.b
    let closeAction = () => { this.props.history.replace('/') }
    if (currentWallet === 'b' && walletB.connected) {
      closeAction = () => { this.props.history.replace('/walletA') }
    } else if (currentWallet === 'a' && walletA.connected) {
      closeAction = () => {
        this.props.history.replace('/initiation')
        this.props.setStep(steps.INITIATION)
      }
    } else if (currentWallet === 'a') {
      closeAction = () => { this.props.history.replace('/walletB') }
    }
    return <WalletConnectPopup
      open
      id={currentWallet}
      currency={this.props.swap.assets[currentWallet].currency}
      walletChosen={this.props.swap.wallets[currentWallet].chosen}
      walletConnecting={this.props.swap.wallets[currentWallet].connecting}
      wallet={this.props.swap.wallets[currentWallet].type}
      chooseWallet={this.props.waitForWallet}
      connectWallet={this.props.waitForWalletInitialization}
      disconnectWallet={this.props.onWalletDisconnected}
      addresses={this.props.swap.wallets[currentWallet].addresses}
      walletConnected={this.props.swap.wallets[currentWallet].connected}
      handleClose={closeAction}
    />
  }

  isSnycing () {
    const syncStarted = this.props.swap.sync['a'].currentBlock && this.props.swap.sync['b'].currentBlock
    const syncing = !this.props.swap.sync['a'].synced || !this.props.swap.sync['b'].synced
    return syncStarted && syncing
  }

  getSyncBar () {
    if (this.isSnycing()) {
      return <div className='LiqualitySwap_sync'><img src={Spinner} alt='Spinner' />&nbsp;&nbsp;Syncing...</div>
    }
  }

  render () {
    return <div className='LiqualitySwap'>
      <div className='LiqualitySwap_bar' />
      <div className='LiqualitySwap_header'>
        <img className='LiqualitySwap_logo' src={LiqualityLogo} alt='Liquality Logo' />
        { this.getSyncBar() }
        { this.props.swap.step && <SwapProgressStepper state={this.props.swap.step} /> }
      </div>
      <div className='LiqualitySwap_main'>
        <div className='LiqualitySwap_wave' />
        <div className='LiqualitySwap_wrapper'>
          <Route exact path='/' render={this.getStartingScreen.bind(this)} />
          <Route path='/offerSelection' component={SwapOfferSelection} />
          <Route path='/offerConfirmation' component={SwapOfferConfirmation} />
          <Route path='/assetSelection' component={AssetSelection} />
          <Route path='/walletA' render={() => { return this.getConnectWallet('a') }} />
          <Route path='/walletB' render={() => { return this.getConnectWallet('b') }} />
          <Route path='/initiation' component={SwapInitiation} />
          <Route path='/backupLink' render={this.getBackupLinkCard} />
          <Route path='/counterPartyLink' render={this.getCounterPartyLinkCard} />
          <Route path='/waiting' component={Waiting} />
          <Route path='/redeem' component={SwapRedemption} />
          <Route path='/completed' component={SwapCompleted} />
          <Route path='/refund' component={SwapRefund} />
          <Route path='/refunded' component={SwapRefunded} />
          <WalletPopups />
        </div>
      </div>
      <footer dangerouslySetInnerHTML={{__html: config.injectFooter}} />
      <ErrorModal open={this.props.error} error={this.props.error} onClose={this.props.clearError} />
    </div>
  }
}

export default LiqualitySwap
