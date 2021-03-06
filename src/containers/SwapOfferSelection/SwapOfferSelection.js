import React, { Component } from 'react'
import _ from 'lodash'
import Button from '../../components/Button/Button'
import SwapPairPanel from '../../components/SwapPairPanel/SwapPairPanel'
import AssetSelector from '../../components/AssetSelector/AssetSelector'
import CurrencyInputs from '../CurrencyInputs'
import SwapIcon from '../../icons/switch.svg'
import './SwapOfferSelection.css'
import { APP_BASE_URL } from '../../utils/app-links'
import config from '../../config'

class SwapOfferSelection extends Component {
  handleSelectAsset (asset) {
    const assetA = this.props.assetSelector.party === 'a' ? asset : this.props.assets.a.currency
    const assetB = this.props.assetSelector.party === 'b' ? asset : this.props.assets.b.currency
    let market = this.props.markets.find(market => market.from === assetA && market.to === assetB)
    if (!market) {
      market = this.props.markets.find(market => market.from === assetA)
    }
    this.props.setMarket(market)
    this.props.closeAssetSelector()
  }

  handlePairPanelAssetClick (party) {
    if (this.props.assetSelector.open) {
      this.props.closeAssetSelector(party)
    } else {
      this.props.openAssetSelector(party)
    }
  }

  getSelectorAssets () {
    const { a: assetA, b: assetB } = this.props.assets
    let assets = []
    if (this.props.assetSelector.party === 'a') {
      assets = this.props.markets.map(market => market.from)
    } else if (this.props.assetSelector.party === 'b') {
      assets = this.props.markets
        .filter(market => market.from === assetA.currency)
        .map(market => market.to)
    }
    const currentSelectedAsset = this.props.assetSelector.party === 'a' ? assetA.currency : assetB.currency
    assets = assets.filter(asset => asset !== currentSelectedAsset)
    return assets
  }

  render () {
    const { a: assetA, b: assetB } = this.props.assets
    const amountEntered = !_.isEmpty(assetA.value)
    const selectorAssets = this.getSelectorAssets()
    const switchSidesAvailable = this.props.markets.find(market => market.from === assetB.currency && market.to === assetA.currency)

    return <div className='SwapOfferSelection'>
      <SwapPairPanel
        haveCurrency={assetA.currency}
        wantCurrency={assetB.currency}
        showCurrencyLabels
        focusSide={this.props.assetSelector.party && (this.props.assetSelector.party === 'a' ? 'have' : 'want')}
        onHaveClick={() => this.handlePairPanelAssetClick('a')}
        onWantClick={() => this.handlePairPanelAssetClick('b')}
        icon={SwapIcon}
        iconDisabled={!switchSidesAvailable}
        onIconClick={() => this.props.switchSides()} />
      <div className='SwapOfferSelection_assetSelector'>
        { this.props.assetSelector.open &&
          <AssetSelector
            search={this.props.assetSelector.search}
            assets={selectorAssets}
            onSelectAsset={asset => this.handleSelectAsset(asset)}
            onSearchChange={value => this.props.setAssetSelectorSearch(value)}
            onClose={() => this.props.closeAssetSelector()} /> }
      </div>
      { !this.props.assetSelector.open && <div className='SwapOfferSelection_top'>
        <CurrencyInputs
          rightInputDisabled
          showInputs
          showErrors
          showRate={amountEntered}
          rateDisabled
          rateStrong
          rateTitle='Estimated Rate'
          leftHelpText={`Min: ${this.props.market.min}   Max: ${this.props.market.max}`} />
        { !amountEntered && <span className='SwapOfferSelection_host'>Trade with <br /><img src={config.hostIcon} alt={config.hostName} /></span> }
      </div> }
      { !this.props.assetSelector.open && <div className='SwapOfferSelection_bottom'>
        <Button wide primary onClick={this.props.retrieveAgentQuote}>See Offer</Button><br />
        <Button wide link onClick={() => window.location.replace(APP_BASE_URL)}>Cancel</Button>
      </div> }
    </div>
  }
}

export default SwapOfferSelection
