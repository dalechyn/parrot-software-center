import React, { useEffect, useState } from 'react'
import { Grid, makeStyles, IconButton } from '@material-ui/core'
import { ExpandMore, ExpandLess, MoreHoriz } from '@material-ui/icons'
import { RouteComponentProps, withRouter } from 'react-router'
import cls from 'classnames'
import UpgradeElement from '../UpgradeElement'
import { QueueNodeMeta } from '../../types/queue'

const useStyles = makeStyles(theme => ({
  detailsLink: {
    marginRight: theme.spacing(2)
  },
  versionHolder: {
    display: 'flex'
  },
  expanded: {
    display: 'inline-block'
  },
  notExpanded: {
    display: 'none'
  }
}))

export type UpdateListInputProp = {
  updates: QueueNodeMeta[]
}
type UpdateListProp = RouteComponentProps & UpdateListInputProp

// TODO: Check React Virtualization to improve performance of the list
const UpdateList = ({ updates: initialUpdates }: UpdateListProp) => {
  const classes = useStyles()
  const [isExpanded, expand] = useState(false)
  const [updates, setUpdates] = useState(initialUpdates)
  const [updateComponents, setUpdateComponents] = useState(
    updates.map((meta, index) => (
      <UpgradeElement
        {...meta}
        key={`updgrade-element-${index}`}
        removeFunction={() => setUpdates([...updates.slice(0, index), ...updates.slice(index + 1)])}
      />
    ))
  )
  const maxItemsShown = 10
  const areUpdatesMoreThanMaxItems = updates.length > maxItemsShown

  useEffect(() => {
    setUpdateComponents(
      updates.map((meta, index) => (
        <UpgradeElement
          {...meta}
          key={`updgrade-element-${index}`}
          removeFunction={() =>
            setUpdates([...updates.slice(0, index), ...updates.slice(index + 1)])
          }
        />
      ))
    )
  }, [updates])

  return (
    <>
      {areUpdatesMoreThanMaxItems ? (
        <div style={{ float: 'right' }}>
          <IconButton onClick={() => expand(!isExpanded)} aria-label="collapse/expanded">
            {isExpanded ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        </div>
      ) : undefined}
      <>
        <Grid container spacing={3} direction="column">
          {updateComponents.slice(0, maxItemsShown)}
        </Grid>
        <Grid
          className={cls(isExpanded ? classes.expanded : classes.notExpanded)}
          container
          direction="column"
          spacing={3}
          style={{ marginTop: 0 }}
        >
          {updateComponents.slice(maxItemsShown)}
        </Grid>
        {!isExpanded && areUpdatesMoreThanMaxItems ? (
          <IconButton
            style={{ borderRadius: '4px' }}
            onClick={() => expand(!isExpanded)}
            aria-label="collapse"
          >
            <MoreHoriz />
          </IconButton>
        ) : null}
      </>
    </>
  )
}

export default withRouter(UpdateList)
